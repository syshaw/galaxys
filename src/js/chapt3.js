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
	gl.useProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("初始化着色器程序失败：" + gl.getProgramInfoLog(shaderProgram));
		gl.deleteProgram(shaderProgram);
		return null;
	}
	return shaderProgram;
}

function initBuffers(gl, program) {
	const position = [
		0.5,	0.5,
	   -0.5,	0.5,
		0.5,   -0.5,
	   -0.5,   -0.5,
	];
	const color = [
		1.0, 1.0, 1.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
	];
	const positionbuffer	= gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionbuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
	const position_tmp = gl.getAttribLocation(program, "a_Position");
	gl.vertexAttribPointer(position_tmp, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(position_tmp);

	const colorbuffer		= gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorbuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
	const color_tmp = gl.getAttribLocation(program, "a_Color");
	gl.vertexAttribPointer(color_tmp, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(color_tmp);

	const u_Pmatrix = gl.getUniformLocation(program, "u_Pmatrix");
	const u_Mmatrix = gl.getUniformLocation(program, "u_Mmatrix");
	const u_Vmatrix = gl.getUniformLocation(program, "u_Vmatrix");

	return {
		projection:u_Pmatrix,
		model:u_Mmatrix,
		view:u_Vmatrix,
	};
}





function drawScene(gl, d_type, d_count)
{
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.drawArrays(d_type, 0, d_count);
}

function main() {
	const cvs = document.querySelector("#glcanvas");
	const gl = cvs.getContext("webgl");

	if (!gl) {alert("初始化WebGL失败，浏览器或设备不支持！");return;}

	const vsSource = `
		attribute vec4 a_Position;
		attribute vec4 a_Color;

		varying lowp vec4 v_Color;

		uniform mat4 u_Pmatrix;//Projection
		uniform mat4 u_Mmatrix;//Model
		uniform mat4 u_Vmatrix;//View
		void main() {
			gl_Position = a_Position * u_Pmatrix * u_Mmatrix * u_Vmatrix;
			v_Color = a_Color;
		}
	`;

	const fsSource = `
		varying lowp vec4 v_Color;
		void main() {
			gl_FragColor = v_Color;
		}
	`;

	const program = initShaderProgram(gl, vsSource, fsSource);
	const buffers = initBuffers(gl, program);


	function getProjection(gl, angle, zMin, zMax)
	{
		var ang = Math.tan(angle*  0.5 * Math.PI/180);
		const aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
		return [
			0.5/ang, 0, 0, 0,
			0, 0.5*aspect/ang, 0, 0,
			0, 0, -(zMax+zMin)/(zMax-zMin), -1,
			0, 0, (-2*zMax*zMin)/(zMax-zMin), 0
		];
	}
	var proj_matrix = getProjection(gl, 10, 0.1, 100);
	var mov_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	var view_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	
	//translating z
	view_matrix[14] = view_matrix[14] - 6;
	
	function rotateZ(m, angle) {
		var c = Math.cos(angle);
		var s = Math.sin(angle);
		var mv0 = m[0], mv4 = m[4], mv8 = m[8]; 
	
		m[0] = c*m[0]-s*m[1];
		m[4] = c*m[4]-s*m[5];
		m[8] = c*m[8]-s*m[9];
		m[1] = c*m[1]+s*mv0;
		m[5] = c*m[5]+s*mv4;
		m[9] = c*m[9]+s*mv8;
	}

	
	var ago = 0;
	function render(now)
	{
		var deltatime = null;
		now *= 0.001;//转换为秒
		deltatime = now - ago;
		rotateZ(mov_matrix, deltatime);
		ago = now;
		
		gl.uniformMatrix4fv(buffers.projection, false, proj_matrix);
		gl.uniformMatrix4fv(buffers.model, false, mov_matrix);
		gl.uniformMatrix4fv(buffers.view, false, view_matrix);

		drawScene(gl, gl.TRIANGLE_STRIP, 4, buffers);
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);

}
