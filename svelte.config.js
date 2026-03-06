import adapter from '@sveltejs/adapter-node';
import vercel from '@sveltejs/adapter-vercel';
import dotenv from 'dotenv';

dotenv.config();

const isVercel = !!process.env.VERCEL;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: { adapter: isVercel ? vercel() : adapter(), experimental: { remoteFunctions: true } },
	compilerOptions: { experimental: { async: true } }
};

export default config;
