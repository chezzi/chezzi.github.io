import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx'; 
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
 site:'https://chezzi.ccwu.cc',
 
 integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  ],

  markdown: {
    // 开启代码高亮（Shiki）
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',        // 推荐主题（暗色）你可以换成 'github-light'、'dracula'、'one-dark-pro' 等
      wrap: true,                  // 自动换行
      // languages: ['js', 'ts', 'astro', 'python', 'cpp'] // 如果需要额外语言可以在这里添加
    },
  },
});

