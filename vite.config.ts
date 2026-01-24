import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
//import fs from 'fs';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	] /*,
	server: { // Uncomment for local https testing
			host: 'local.bookwaves.de',
			https: {
				key: fs.readFileSync('./cert/key.pem'),
				cert: fs.readFileSync('./cert/cert.pem')
			},
			//proxy: {}
		},*/
});
