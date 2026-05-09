// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import remarkLatexStructure from './src/lib/remarkLatexStructure.mjs';
import rehypeMathjaxDelimiters from './src/lib/rehypeMathjaxDelimiters.mjs';

export default defineConfig({
  site: 'https://chezzi.ccwu.cc',

  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    remarkPlugins: [remarkLatexStructure, remarkMath],
    rehypePlugins: [rehypeMathjaxDelimiters],
  },

  integrations: [
    mdx({
      extendMarkdownConfig: true,
    }),
  ],
});
