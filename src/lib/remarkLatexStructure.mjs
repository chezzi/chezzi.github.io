const commandDepths = {
  chapter: 2,
  section: 3,
  subsection: 4,
  subsubsection: 5,
};

function textValue(node) {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (!Array.isArray(node.children)) return "";
  return node.children.map(textValue).join("");
}

function cleanHeadingText(value) {
  return value.trim().replace(/^\d+(?:\.\d+)*\.?\s+/, "");
}

function parseLatexHeading(value) {
  const match = value
    .trim()
    .match(
      /^\\(chapter|section|subsection|subsubsection)\\?\{([^{}]+)\\?\}(?:\s*\\label\\?\{([^{}]+)\\?\})?$/,
    );

  if (!match) return null;

  return {
    command: match[1],
    title: match[2].trim(),
    label: match[3]?.trim(),
  };
}

function parseLabel(value) {
  const match = value.trim().match(/^\\label\\?\{([^{}]+)\\?\}$/);
  return match?.[1]?.trim();
}

function addHeadingNumber(node, counters) {
  if (node.depth < 2 || node.depth > 6) return;

  counters[node.depth] = (counters[node.depth] ?? 0) + 1;

  for (let depth = node.depth + 1; depth <= 6; depth += 1) {
    counters[depth] = 0;
  }

  const parts = [];
  for (let depth = 2; depth <= node.depth; depth += 1) {
    if ((counters[depth] ?? 0) === 0) continue;
    parts.push(counters[depth]);
  }

  if (parts.length === 0) return;

  const sectionNumber = parts.join(".");
  const displayNumber =
    parts.length === 1 ? `${sectionNumber}.` : sectionNumber;

  if (node.children?.[0]?.type === "text") {
    node.children[0].value = cleanHeadingText(node.children[0].value);
  }

  node.children = [
    { type: "text", value: `${displayNumber} ` },
    ...(node.children ?? []),
  ];

  node.data = node.data ?? {};
  node.data.hProperties = node.data.hProperties ?? {};
  node.data.hProperties["data-section-number"] = sectionNumber;
}

function attachId(node, id) {
  if (!id) return;

  node.data = node.data ?? {};
  node.data.hProperties = node.data.hProperties ?? {};
  node.data.hProperties.id = id;
}

function headingNumber(node) {
  return node.data?.hProperties?.["data-section-number"];
}

function replaceHeadingRefs(node, labelIndex) {
  if (!node || !Array.isArray(node.children)) return;
  if (["code", "inlineCode", "math", "inlineMath"].includes(node.type)) return;

  const children = [];

  for (const child of node.children) {
    if (child.type !== "text") {
      replaceHeadingRefs(child, labelIndex);
      children.push(child);
      continue;
    }

    const value = child.value;
    const pattern = /\\(ref|eqref)\\?\{([^{}]+)\\?\}/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(value)) !== null) {
      const label = match[2];
      const target = labelIndex.get(label);

      if (!target) continue;

      if (match.index > lastIndex) {
        children.push({ type: "text", value: value.slice(lastIndex, match.index) });
      }

      children.push({
        type: "link",
        url: `#${target.id}`,
        children: [
          {
            type: "text",
            value: match[1] === "eqref" ? `(${target.number})` : target.number,
          },
        ],
      });

      lastIndex = pattern.lastIndex;
    }

    if (lastIndex === 0) {
      children.push(child);
      continue;
    }

    if (lastIndex < value.length) {
      children.push({ type: "text", value: value.slice(lastIndex) });
    }
  }

  node.children = children;
}

export default function remarkLatexStructure() {
  return (tree) => {
    if (!Array.isArray(tree.children)) return;

    const counters = {};
    const labelIndex = new Map();
    const children = [];
    let previousHeading = null;

    for (const node of tree.children) {
      if (node.type === "paragraph") {
        const value = textValue(node);
        const latexHeading = parseLatexHeading(value);

        if (latexHeading) {
          const heading = {
            type: "heading",
            depth: commandDepths[latexHeading.command],
            children: [{ type: "text", value: latexHeading.title }],
            data: {
              hProperties: {
                "data-latex-heading": latexHeading.command,
              },
            },
          };

          attachId(heading, latexHeading.label);
          addHeadingNumber(heading, counters);
          if (latexHeading.label) {
            labelIndex.set(latexHeading.label, {
              id: latexHeading.label,
              number: headingNumber(heading),
            });
          }
          children.push(heading);
          previousHeading = heading;
          continue;
        }

        const label = parseLabel(value);
        if (label && previousHeading) {
          attachId(previousHeading, label);
          labelIndex.set(label, {
            id: label,
            number: headingNumber(previousHeading),
          });
          continue;
        }
      }

      if (node.type === "heading") {
        if (node.children?.[0]?.type === "text") {
          node.children[0].value = cleanHeadingText(node.children[0].value);
        }

        addHeadingNumber(node, counters);
        children.push(node);
        previousHeading = node;
        continue;
      }

      children.push(node);
    }

    tree.children = children;
    replaceHeadingRefs(tree, labelIndex);
  };
}
