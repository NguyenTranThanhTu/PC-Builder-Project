/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cdn2.cellphones.com.vn',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'tse1.mm.bing.net',
				pathname: '/**',
			},
		],
		domains: ['localhost'],
	},
};

module.exports = nextConfig;
