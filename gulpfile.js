const gulp = require('gulp');
const esbuild = require('gulp-esbuild');
const {exec} = require('child_process');

function bundle() {
	return gulp
		.src('./src/app.ts')
		.pipe(
			esbuild({
				outfile: 'bundle.js',
				sourcemap: 'both',
				bundle: true,
				target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
				loader: {
					'.ts': 'ts',
					'.json': 'json',
				},
			})
		)
		.pipe(gulp.dest('./dist/'));
}

function copyPublic() {
	return gulp.src(['./public/index.html', './public/style.css']).pipe(gulp.dest('./dist'));
}

function copyTextures() {
	return gulp.src('./src/assets/textures/**').pipe(gulp.dest('./dist/textures'));
}

function watch() {
	exec('reload -b --dir=dist --port=5000', err => {
		if (err) throw err;
	});

	return gulp.watch(['src/**/*.ts', 'src/assets/**/*.json'], bundle);
}

exports.bundle = gulp.series(copyPublic, copyTextures, bundle);
exports.watch = gulp.series(copyPublic, copyTextures, watch);
