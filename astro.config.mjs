import { defineConfig } from 'astro/config';

export default defineConfig({
 site:'https://chezzi.github.io',
 # // 如果你的网站将部署在 https://chezzi.github.io/ 下，site 可以设置为 'https://chezzi.github.io'
 # // 如果部署在子路径（如 https://chezzi.github.io/my-repo/），则需要设置 base: '/my-repo'
 # site: 'https://chezzi.github.io',
 # // base: '/你的仓库名',   // 如果是用户/组织 Pages（username.github.io），则不需要 base
});
