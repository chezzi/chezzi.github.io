function hasClass(node, className) {
  const classNames = node.properties?.className ?? [];
  return Array.isArray(classNames) && classNames.includes(className);
}

function textValue(node) {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (!Array.isArray(node.children)) return "";
  return node.children.map(textValue).join("");
}

function withInlineMathRefs(value) {
  return value.replace(/(^|[^$\\])\\(eqref|ref)\\?\{([^{}]+)\\?\}/g, (_, prefix, command, label) => {
    return `${prefix}$\\${command}{${label}}$`;
  });
}

export default function rehypeMathjaxDelimiters() {
  return (tree) => {
    function walk(node) {
      if (!node || !Array.isArray(node.children)) return;

      for (let i = 0; i < node.children.length; i += 1) {
        const child = node.children[i];

        if (
          child.type === "element" &&
          child.tagName === "code" &&
          hasClass(child, "math-inline")
        ) {
          node.children[i] = {
            type: "text",
            value: `$${textValue(child)}$`,
          };
          continue;
        }

        if (
          child.type === "element" &&
          child.tagName === "pre" &&
          child.children?.[0]?.type === "element" &&
          child.children[0].tagName === "code" &&
          hasClass(child.children[0], "math-display")
        ) {
          node.children[i] = {
            type: "text",
            value: `$$\n${textValue(child.children[0])}\n$$`,
          };
          continue;
        }

        if (child.type === "element" && ["code", "pre", "script", "style"].includes(child.tagName)) {
          continue;
        }

        if (child.type === "text") {
          child.value = withInlineMathRefs(child.value);
          continue;
        }

        walk(child);
      }
    }

    walk(tree);
  };
}
