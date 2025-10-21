const withPWA = require("next-pwa")({
	dest: "public",
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		unoptimized: true,
		domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
	},
	serverExternalPackages: ["@prisma/client", "bcrypt"],
	webpack: (config, { isServer }) => {
		// Fix for PostHog instrumentation trying to use Node.js modules in the browser.
		// Two approaches combined:
		// 1) Provide fallbacks/aliases for plain builtin names to `false` so bundler ignores them.
		// 2) Add a NormalModuleReplacementPlugin to rewrite imports that use the `node:` scheme
		//    (e.g. `node:fs`) to the plain name (`fs`) so our fallbacks apply and Webpack
		//    doesn't try to treat `node:` as a special URI scheme.
		if (!isServer) {
			// Ensure resolve objects exist
			config.resolve = config.resolve || {};
			config.resolve.alias = {
				...(config.resolve.alias || {}),
				// Treat explicit node: imports as missing in browser builds
				"node:child_process": false,
				"node:fs": false,
				"node:net": false,
				"node:tls": false,
				"node:crypto": false,
				"node:path": false,
			};

			config.resolve.fallback = {
				...(config.resolve.fallback || {}),
				child_process: false,
				fs: false,
				net: false,
				tls: false,
				crypto: false,
				path: false,
			};

			// Add NormalModuleReplacementPlugin to rewrite `node:xxx` -> `xxx` so our
			// fallback/alias entries are applied. This avoids the UnhandledSchemeError
			// that occurs when Webpack sees the `node:` scheme.
			const webpack = require("webpack");
			config.plugins = config.plugins || [];
			config.plugins.push(
				new webpack.NormalModuleReplacementPlugin(/^node:(.+)$/, (resource) => {
					// resource.request is like 'node:fs' -> replace to 'fs'
					if (resource.request && typeof resource.request === "string") {
						resource.request = resource.request.replace(/^node:/, "");
					}
				})
			);
		}
		return config;
	},
	async rewrites() {
		return [
			{
				source: "/ph/static/:path*", // Proxy path for static assets
				destination: "https://eu-assets.i.posthog.com/static/:path*", // PostHog's static assets domain
			},
			{
				source: "/ph/:path*", // Proxy path for all other PostHog API requests
				destination: "https://eu.i.posthog.com/:path*", // PostHog's data ingestion domain
			},
		];
	},
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
};

module.exports = withPWA(nextConfig);
