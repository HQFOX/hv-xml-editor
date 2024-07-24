/// <reference types="vite/client" />
/// <reference types="vitest" />

import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import unoCSS from "unocss/vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

import { HvAppShellVitePlugin } from "@hitachivantara/app-shell-vite-plugin";

export default defineConfig(({ mode }) => ({
	optimizeDeps: {
		exclude: ["xmllint-wasm"],
	},
	plugins: [
		react({
			jsxImportSource: "@emotion/react",
			babel: {
				plugins: ["@emotion/babel-plugin"],
			},
		}),
		tsconfigPaths(),
		unoCSS({ mode: "per-module" }),
		cssInjectedByJsPlugin({
			relativeCSSInjection: true,
		}),
		HvAppShellVitePlugin({
			mode,
			autoViewsAndRoutes: true,
			autoMenu: true,
		}),
	],

	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["src/tests/setupTests.ts"],
		reporters: "default",
		coverage: {
			enabled: false, // disabled by default. run vitest with --coverage
			provider: "v8",
			reporter: "lcov",
			include: ["src/**/*.ts?(x)"],
			exclude: [
				"src/**/mocks/*",
				"src/**/tests/*",
				"src/**/*.test.ts?(x)",
				"src/**/styles.[jt]s?(x)",
				"src/**/*.d.ts",
				"src/*.tsx",
			],
		},
	},
}));
