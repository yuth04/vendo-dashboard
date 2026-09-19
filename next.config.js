/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://applicable-bert-yuthdev-d543ccf2.koyeb.app/api/:path*',
            },
        ];
    },
};

export default nextConfig;