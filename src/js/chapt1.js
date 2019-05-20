function loadShader(gl, type, sourcecode) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, sourcecode);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("着色器编译发生错误：" + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader		= loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader	= loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
	const shaderProgram		= gl.createProgram();

	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("初始化着色器程序失败：" + gl.getShaderInfoLog(shaderProgram));
		gl.deleteProgram(shaderProgram);
		return null;
	}
	gl.useProgram(shaderProgram);
	return shaderProgram;
}

function initBuffers(gl, program) {
	const position = [
		0.5,	0.5,
	   -0.5,	0.5,
		0.5,   -0.5,
	   -0.5,   -0.5,
	];
	const positionbuffer = gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, positionbuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
	const position_tmp = gl.getAttribLocation(program, "aVertexPosition");
	gl.vertexAttribPointer(position_tmp, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(position_tmp);
}

function drawScene(gl, d_type, d_count)
{
	gl.clearColor(1.0, 1.0, 1.0, 0.5);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//gl.viewport(0, 0, cvs.width, cvs. height);

	//const offset = 0;const vertexCount = 4;
	gl.drawArrays(d_type, 0, d_count);
}

function main() {
	const cvs = document.querySelector("#glcanvas");
	const gl = cvs.getContext("webgl");

	if (!gl) {alert("初始化WebGL失败，浏览器或设备不支持！");return;}

	const vsSource = `
		attribute vec4 aVertexPosition;

		void main() {
			gl_Position = aVertexPosition;
		}
	`;

	const fsSource = `
		void main() {
			gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
		}
	`;

	const program = initShaderProgram(gl, vsSource, fsSource);
	const buffers = initBuffers(gl, program);

	drawScene(gl, gl.TRIANGLE_STRIP, 4);

}
