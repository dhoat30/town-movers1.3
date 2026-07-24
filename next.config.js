const { siteUrl } = require('./next-sitemap.config');

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.NODE_ENV === "production" ? "https://www.townmovers.com.au" : "http://localhost:3000");
    const siteName = "Town Movers";

// bundle analyzer 
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfigp} */
const nextConfig = {

    compiler: {
        // Enables the styled-components SWC transform
        styledComponents: true
    },
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'data.webduel.co.nz',
            port: '',
            pathname: '/**'
        },
        {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
            port: '',
            pathname: '/**'
        }
        
    ],
    },
    env: {
        url: "https://data.webduel.co.nz",
        siteUrl: baseUrl,
        siteName: siteName,
    },

}

module.exports = withBundleAnalyzer(nextConfig)