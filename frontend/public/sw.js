if (!self.define) {
	let e,
		a = {};
	const s = (s, i) => (
		(s = new URL(s + ".js", i).href),
		a[s] ||
			new Promise((a) => {
				if ("document" in self) {
					const e = document.createElement("script");
					(e.src = s), (e.onload = a), document.head.appendChild(e);
				} else (e = s), importScripts(s), a();
			}).then(() => {
				let e = a[s];
				if (!e) throw new Error(`Module ${s} didn’t register its module`);
				return e;
			})
	);
	self.define = (i, t) => {
		const n =
			e ||
			("document" in self ? document.currentScript.src : "") ||
			location.href;
		if (a[n]) return;
		let c = {};
		const r = (e) => s(e, n),
			d = { module: { uri: n }, exports: c, require: r };
		a[n] = Promise.all(i.map((e) => d[e] || r(e))).then((e) => (t(...e), c));
	};
}
define(["./workbox-1bb06f5e"], function (e) {
	"use strict";
	importScripts(),
		self.skipWaiting(),
		e.clientsClaim(),
		e.precacheAndRoute(
			[
				{
					url: "/_next/app-build-manifest.json",
					revision: "3159fea74a3a275e8bd1f542ad526937",
				},
				{
					url: "/_next/static/chunks/1205-87bd188d7bfd946d.js",
					revision: "87bd188d7bfd946d",
				},
				{
					url: "/_next/static/chunks/1423-f62b607727f8b474.js",
					revision: "f62b607727f8b474",
				},
				{
					url: "/_next/static/chunks/152-1f2cdd3df05811cf.js",
					revision: "1f2cdd3df05811cf",
				},
				{
					url: "/_next/static/chunks/17-8c9d73b7ffeeb43e.js",
					revision: "8c9d73b7ffeeb43e",
				},
				{
					url: "/_next/static/chunks/3068-9dccd10051f3cd30.js",
					revision: "9dccd10051f3cd30",
				},
				{
					url: "/_next/static/chunks/3241-ff2c7d442f28fc20.js",
					revision: "ff2c7d442f28fc20",
				},
				{
					url: "/_next/static/chunks/3470-a98a87272bf1682a.js",
					revision: "a98a87272bf1682a",
				},
				{
					url: "/_next/static/chunks/4371-b22de4d923a93417.js",
					revision: "b22de4d923a93417",
				},
				{
					url: "/_next/static/chunks/4999-949d475e8282d549.js",
					revision: "949d475e8282d549",
				},
				{
					url: "/_next/static/chunks/4bd1b696-100b9d70ed4e49c1.js",
					revision: "100b9d70ed4e49c1",
				},
				{
					url: "/_next/static/chunks/579-dccc75e8dd494960.js",
					revision: "dccc75e8dd494960",
				},
				{
					url: "/_next/static/chunks/6298-48c8d903437f9157.js",
					revision: "48c8d903437f9157",
				},
				{
					url: "/_next/static/chunks/6964-a3bdf87de96ed421.js",
					revision: "a3bdf87de96ed421",
				},
				{
					url: "/_next/static/chunks/7216-c788db59e6edf41c.js",
					revision: "c788db59e6edf41c",
				},
				{
					url: "/_next/static/chunks/7353-3d40d190cc40726d.js",
					revision: "3d40d190cc40726d",
				},
				{
					url: "/_next/static/chunks/7474-2d3b7fa567cf47ba.js",
					revision: "2d3b7fa567cf47ba",
				},
				{
					url: "/_next/static/chunks/7892-fd347a2e3fb50bbc.js",
					revision: "fd347a2e3fb50bbc",
				},
				{
					url: "/_next/static/chunks/889-f58e9ed7ba78561b.js",
					revision: "f58e9ed7ba78561b",
				},
				{
					url: "/_next/static/chunks/9139-9a6d3cf2c9ed1b4f.js",
					revision: "9a6d3cf2c9ed1b4f",
				},
				{
					url: "/_next/static/chunks/9148-de4eafd0fadbda6d.js",
					revision: "de4eafd0fadbda6d",
				},
				{
					url: "/_next/static/chunks/9494-8e0aec7cd6ddac66.js",
					revision: "8e0aec7cd6ddac66",
				},
				{
					url: "/_next/static/chunks/9788-43f3848da8baa3a6.js",
					revision: "43f3848da8baa3a6",
				},
				{
					url: "/_next/static/chunks/9874-5be54d1808f98ca4.js",
					revision: "5be54d1808f98ca4",
				},
				{
					url: "/_next/static/chunks/9941-0fada61086f45ef2.js",
					revision: "0fada61086f45ef2",
				},
				{
					url: "/_next/static/chunks/app/_not-found/page-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/about/page-0732c46a6e7efebf.js",
					revision: "0732c46a6e7efebf",
				},
				{
					url: "/_next/static/chunks/app/account/page-60dd8bf616fef321.js",
					revision: "60dd8bf616fef321",
				},
				{
					url: "/_next/static/chunks/app/api/(backend-interface)/analysis/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(backend-interface)/ats/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(backend-interface)/cold-mail/edit/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(backend-interface)/cold-mail/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(backend-interface)/gen-answer/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(backend-interface)/linkedin-post-generator/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(backend-interface)/tailored-resume/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(backend-interface)/tips/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(db)/cold-mails/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(db)/dashboard/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(db)/interviews/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(db)/recruter/show-all/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(db)/resumes/%5Bid%5D/download/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(db)/resumes/%5Bid%5D/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(db)/resumes/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(db)/roles/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(db)/user/update-avatar/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(resume-gen)/download-resume/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/(resume-gen)/generate-latex/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/auth/%5B...nextauth%5D/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/auth/confirm-reset/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/auth/delete-account/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/auth/register/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/auth/resend-verification/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/auth/reset-password/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/auth/update-role/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/auth/verify-email/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/api/proxy-image/route-137362efb5e4593a.js",
					revision: "137362efb5e4593a",
				},
				{
					url: "/_next/static/chunks/app/auth/forgot-password/page-958d789b48083e3c.js",
					revision: "958d789b48083e3c",
				},
				{
					url: "/_next/static/chunks/app/auth/page-47adc71e4ac50a57.js",
					revision: "47adc71e4ac50a57",
				},
				{
					url: "/_next/static/chunks/app/auth/resend-verification/page-50cdbc6273e0827f.js",
					revision: "50cdbc6273e0827f",
				},
				{
					url: "/_next/static/chunks/app/auth/reset-password/page-bb95aad8e287d7a6.js",
					revision: "bb95aad8e287d7a6",
				},
				{
					url: "/_next/static/chunks/app/auth/verify-email/page-5704e35d457d3afb.js",
					revision: "5704e35d457d3afb",
				},
				{
					url: "/_next/static/chunks/app/dashboard/admin/page-a70626d237007b03.js",
					revision: "a70626d237007b03",
				},
				{
					url: "/_next/static/chunks/app/dashboard/analysis/%5Bid%5D/page-5af4f909822237d7.js",
					revision: "5af4f909822237d7",
				},
				{
					url: "/_next/static/chunks/app/dashboard/analysis/detailed/page-d606d6db9fb844ae.js",
					revision: "d606d6db9fb844ae",
				},
				{
					url: "/_next/static/chunks/app/dashboard/ats/page-c578b004a2708a5f.js",
					revision: "c578b004a2708a5f",
				},
				{
					url: "/_next/static/chunks/app/dashboard/cold-mail/page-4d6d49583a1144df.js",
					revision: "4d6d49583a1144df",
				},
				{
					url: "/_next/static/chunks/app/dashboard/hiring-assistant/page-a74d7ffb1fb9087e.js",
					revision: "a74d7ffb1fb9087e",
				},
				{
					url: "/_next/static/chunks/app/dashboard/linkedin-posts/page-3dd337c14215b9a0.js",
					revision: "3dd337c14215b9a0",
				},
				{
					url: "/_next/static/chunks/app/dashboard/page-ca4d4984b4025824.js",
					revision: "ca4d4984b4025824",
				},
				{
					url: "/_next/static/chunks/app/dashboard/pdf-resume/page-b61c4204665e3186.js",
					revision: "b61c4204665e3186",
				},
				{
					url: "/_next/static/chunks/app/dashboard/recruiter/page-f859b555605ce242.js",
					revision: "f859b555605ce242",
				},
				{
					url: "/_next/static/chunks/app/dashboard/seeker/page-80a4a2d6d0d5a41f.js",
					revision: "80a4a2d6d0d5a41f",
				},
				{
					url: "/_next/static/chunks/app/dashboard/tips/page-e6bf6e0db0fd7711.js",
					revision: "e6bf6e0db0fd7711",
				},
				{
					url: "/_next/static/chunks/app/layout-b527552253ac20d7.js",
					revision: "b527552253ac20d7",
				},
				{
					url: "/_next/static/chunks/app/not-found-826dea083db6fe72.js",
					revision: "826dea083db6fe72",
				},
				{
					url: "/_next/static/chunks/app/page-627169294279a58e.js",
					revision: "627169294279a58e",
				},
				{
					url: "/_next/static/chunks/app/resume-analysis/page-537a89c14b57329f.js",
					revision: "537a89c14b57329f",
				},
				{
					url: "/_next/static/chunks/app/select-role/page-e15e06a5def6c425.js",
					revision: "e15e06a5def6c425",
				},
				{
					url: "/_next/static/chunks/framework-97862ef36bc4065f.js",
					revision: "97862ef36bc4065f",
				},
				{
					url: "/_next/static/chunks/main-0202e74b778fd419.js",
					revision: "0202e74b778fd419",
				},
				{
					url: "/_next/static/chunks/main-app-422277b3bf4b2a92.js",
					revision: "422277b3bf4b2a92",
				},
				{
					url: "/_next/static/chunks/pages/_app-4b3fb5e477a0267f.js",
					revision: "4b3fb5e477a0267f",
				},
				{
					url: "/_next/static/chunks/pages/_error-c970d8b55ace1b48.js",
					revision: "c970d8b55ace1b48",
				},
				{
					url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
					revision: "846118c33b2c0e922d7b3a7676f81f6f",
				},
				{
					url: "/_next/static/chunks/webpack-ac9d0af54e32c351.js",
					revision: "ac9d0af54e32c351",
				},
				{
					url: "/_next/static/css/8f004eda0bd9e623.css",
					revision: "8f004eda0bd9e623",
				},
				{
					url: "/_next/static/css/e549d2323f7bc808.css",
					revision: "e549d2323f7bc808",
				},
				{
					url: "/_next/static/jtm6XXLB7DhqD5i7KfUfj/_buildManifest.js",
					revision: "657e35bb529f44c60544c3d1501fc884",
				},
				{
					url: "/_next/static/jtm6XXLB7DhqD5i7KfUfj/_ssgManifest.js",
					revision: "b6652df95db52feb4daf4eca35380933",
				},
				{
					url: "/_next/static/media/07d468ddf7350ed5-s.woff2",
					revision: "85b0a225986895808fad895d3aeb1df6",
				},
				{
					url: "/_next/static/media/215b7dfa0255317a-s.p.woff2",
					revision: "850ae1e778721e2e6fb7d6c118b659f9",
				},
				{
					url: "/_next/static/media/35d29cc38e277dea-s.woff2",
					revision: "059b0e4f51663ce343f88df8ff19f425",
				},
				{
					url: "/_next/static/media/6210b7a783c2f3da-s.woff2",
					revision: "8bd2c5c6da13c0a2ab1a84528f483443",
				},
				{
					url: "/_next/static/media/banner-dark.77165aee.svg",
					revision: "b412dba24b60556b596c218596ad5b68",
				},
				{
					url: "/_next/static/media/e7a7e5dfd8853b53-s.woff2",
					revision: "22254290f03af85da6545a47ab459130",
				},
				{
					url: "/_next/static/media/f818a3577f594807-s.woff2",
					revision: "3890d91f277d479be78dde244c29842c",
				},
				{
					url: "/banner-dark.svg",
					revision: "b412dba24b60556b596c218596ad5b68",
				},
				{ url: "/banner.svg", revision: "49ca156618283cc1084471b459aaa613" },
				{
					url: "/database-archetecture.png",
					revision: "dfc689766f6bd6e9adf9d6b8aa17b2e8",
				},
				{
					url: "/database-relationships.png",
					revision: "a0ea7d2a1b760dbb9d795b0fd55c9bdc",
				},
				{ url: "/db-arch.svg", revision: "0a77bc76fd9e0c992e42ca1e533596d7" },
				{ url: "/flowchat.svg", revision: "22f96c31b9cb8863606ac750b55f21b6" },
				{ url: "/icon.svg", revision: "9bba683b81344eef9a3e245f8841a483" },
				{
					url: "/icons/cold-mail.png",
					revision: "9ab3842cf86fa6fbbb4114ae51469074",
				},
				{
					url: "/icons/cold-mail.svg",
					revision: "69eb0a7712e09a0a149178b8c90e5b90",
				},
				{
					url: "/icons/dashboard.png",
					revision: "9ab3842cf86fa6fbbb4114ae51469074",
				},
				{
					url: "/icons/dashboard.svg",
					revision: "f21b491ae3ae972fd623fc13a6d8b3f5",
				},
				{
					url: "/icons/hiring.png",
					revision: "9ab3842cf86fa6fbbb4114ae51469074",
				},
				{
					url: "/icons/hiring.svg",
					revision: "49ad5e76cde221abd0ce66c1da631512",
				},
				{
					url: "/icons/icon-192x192.png",
					revision: "9ab3842cf86fa6fbbb4114ae51469074",
				},
				{
					url: "/icons/icon-512x512.png",
					revision: "455041695e7459fa40513b383fb204d3",
				},
				{ url: "/manifest.json", revision: "ed10e252114a21266293a6c0c9364458" },
				{
					url: "/table-realtions.svg",
					revision: "381f885317d2725e41b84e1d4a9c6f87",
				},
			],
			{ ignoreURLParametersMatching: [] }
		),
		e.cleanupOutdatedCaches(),
		e.registerRoute(
			"/",
			new e.NetworkFirst({
				cacheName: "start-url",
				plugins: [
					{
						cacheWillUpdate: async ({
							request: e,
							response: a,
							event: s,
							state: i,
						}) =>
							a && "opaqueredirect" === a.type
								? new Response(a.body, {
										status: 200,
										statusText: "OK",
										headers: a.headers,
								  })
								: a,
					},
				],
			}),
			"GET"
		),
		e.registerRoute(
			/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
			new e.CacheFirst({
				cacheName: "google-fonts-webfonts",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
			new e.StaleWhileRevalidate({
				cacheName: "google-fonts-stylesheets",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
			new e.StaleWhileRevalidate({
				cacheName: "static-font-assets",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
			new e.StaleWhileRevalidate({
				cacheName: "static-image-assets",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			/\/_next\/image\?url=.+$/i,
			new e.StaleWhileRevalidate({
				cacheName: "next-image",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			/\.(?:mp3|wav|ogg)$/i,
			new e.CacheFirst({
				cacheName: "static-audio-assets",
				plugins: [
					new e.RangeRequestsPlugin(),
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			/\.(?:mp4)$/i,
			new e.CacheFirst({
				cacheName: "static-video-assets",
				plugins: [
					new e.RangeRequestsPlugin(),
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			/\.(?:js)$/i,
			new e.StaleWhileRevalidate({
				cacheName: "static-js-assets",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			/\.(?:css|less)$/i,
			new e.StaleWhileRevalidate({
				cacheName: "static-style-assets",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			/\/_next\/data\/.+\/.+\.json$/i,
			new e.StaleWhileRevalidate({
				cacheName: "next-data",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			/\.(?:json|xml|csv)$/i,
			new e.NetworkFirst({
				cacheName: "static-data-assets",
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			({ url: e }) => {
				if (!(self.origin === e.origin)) return !1;
				const a = e.pathname;
				return !a.startsWith("/api/auth/") && !!a.startsWith("/api/");
			},
			new e.NetworkFirst({
				cacheName: "apis",
				networkTimeoutSeconds: 10,
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			({ url: e }) => {
				if (!(self.origin === e.origin)) return !1;
				return !e.pathname.startsWith("/api/");
			},
			new e.NetworkFirst({
				cacheName: "others",
				networkTimeoutSeconds: 10,
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
				],
			}),
			"GET"
		),
		e.registerRoute(
			({ url: e }) => !(self.origin === e.origin),
			new e.NetworkFirst({
				cacheName: "cross-origin",
				networkTimeoutSeconds: 10,
				plugins: [
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
				],
			}),
			"GET"
		);
});
