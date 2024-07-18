const MainCanvas = document.getElementById('main_canvas')

const AxisCanvas = document.getElementById('axis_canvas')
const AxisLayer = AxisCanvas.getContext('2d')

const GridCanvas = document.getElementById('grid_canvas')
const GridLayer = GridCanvas.getContext('2d')

const LineCanvas = document.getElementById('line_canvas')
const LineLayer = LineCanvas.getContext('2d')

const MeanCanvas = document.getElementById('mean_canvas')
const MeanLayer = MeanCanvas.getContext('2d')

const ErrorCanvas = document.getElementById('error_canvas')
const ErrorLayer = ErrorCanvas.getContext('2d')

const Record = document.getElementById('record')

const control_point1 = document.getElementById('control_point1')
const control_point2 = document.getElementById('control_point2')

const equation0 = document.getElementById('equation0')
const equation1 = document.getElementById('equation1')
const equation2 = document.getElementById('equation2')
const slope_sign = document.getElementById('slope_sign')
const slope_value = document.getElementById('slope_value')
const equation3 = document.getElementById('equation3')
const equation4 = document.getElementById('equation4')
const intercept_sign = document.getElementById('intercept_sign')
const intercept_value = document.getElementById('intercept_value')

const sse_label = document.getElementById('sse')
const ssr_label = document.getElementById('ssr')
const sst_label = document.getElementById('sst')
const rsq_label = document.getElementById('r_sq')

const equation0_x = 640
const equation0_y = 30
const equation1_x = 660
const equation1_y = 60
var equation_next_x

const prediction_label = document.getElementById('prediction_label')
const prediction_pointer = document.getElementById('prediction_pointer')

const page_margin_left = 40
const page_margin_top = 40

const MainCanvas_width = 1080
const MainCanvas_height = 720

const canvas_width = 640
const canvas_height = 640
const canvas_margin = 40

const axis_width = canvas_width - canvas_margin * 2
const axis_height = canvas_height - canvas_margin * 2
const axis_x_scale = 50
const axis_x_interval = 10
const axis_y_scale = 270
const axis_y_interval = 30
const axis_label_width = 40
const axis_label_height = 40

const control_point_size = 16
const data_point_size = 8
const n_data_points = 20

const prediction_pointer_size = 4

const actual_slope = 8
const actual_intercept = -50
const error_std = 20

var control_point_names = ['control_point1', 'control_point2']
var control_point_axis_coordinates = {'control_point1': [0, axis_y_interval], 'control_point2': [axis_x_scale-axis_x_interval, axis_y_scale-axis_y_interval]}
var control_point_canvas_coordinates = {'control_point1': [0, 0], 'control_point2': [0, 0]}
var control_point_anchors = {'control_point1': [0, 0], 'control_point2': [axis_x_scale/2, axis_y_scale/2]}

var canvas_limit = [0, 0, 0, 0] // Top, Bottom, Left, Right

const max_day = 10

var n_initial_data_points = 8
var data_points = []
var predictions = []
var n_dp_rows = 0

var sum_y = 0
var mean_y = 0

var sse = 0
var ssr = 0
var sst = 0
var rsq = 0

var slope = 0
var intercept = 0
var isDragging = false

var instruction_on = true
var game_on = false
var game_end = false

document.addEventListener('DOMContentLoaded', () => {
	initialize_canvas()
	initialize_axis()
	set_canvas_limit()
	
	initialize_equation_position()
	initialize_control_points()
	initialize_data_points()
	initialize_mean_line()
	
	update_data_points()
	update_regression_line()
	update_score()
	update_error()
})

document.addEventListener('mousemove', () => {
	hover_prediction()
})

function initialize_canvas() {
	MainCanvas.style.left = `${page_margin_left}px`
    MainCanvas.style.top = `${page_margin_top}px`
	MainCanvas.style.width = `${MainCanvas_width}px`
    MainCanvas.style.height = `${MainCanvas_height}px`
	
	AxisCanvas.width = canvas_width
    AxisCanvas.height = canvas_height
	AxisCanvas.style.width = `${canvas_width}px`
    AxisCanvas.style.height = `${canvas_height}px`
	
	LineCanvas.width = canvas_width
    LineCanvas.height = canvas_height
	LineCanvas.style.width = `${canvas_width}px`
    LineCanvas.style.height = `${canvas_height}px`
}

function initialize_axis() {
	x0 = canvas_margin
	y0 = canvas_margin
	x1 = canvas_margin
	y1 = canvas_height - canvas_margin
	x2 = canvas_width - canvas_margin
	y2 = canvas_height - canvas_margin
	x_canvas_interval = axis_width / (axis_x_scale / axis_x_interval)
	y_canvas_interval = axis_height / (axis_y_scale / axis_y_interval)
	
	n_h_grids = Math.floor(axis_x_scale / axis_x_interval)
	n_v_grids = Math.floor(axis_y_scale / axis_y_interval)
	
	canvas = AxisLayer
	canvas.beginPath()
	
	canvas.moveTo(x0, y0)
	canvas.lineTo(x1, y1)
	canvas.lineTo(x2, y2)
	
	canvas.moveTo(x0-8, y0+8)
	canvas.lineTo(x0, y0)
	canvas.lineTo(x0+8, y0+8)
	
	canvas.moveTo(x2-8, y2-8)
	canvas.lineTo(x2, y2)
	canvas.lineTo(x2-8, y2+8)
	
	canvas.lineWidth = 3; 
	canvas.strokeStyle = "#000000"
	canvas.stroke()
	
	new_label = document.createElement('div');
	new_label.className = 'axis_label';
	new_label.innerHTML = 0
	
	x = 0
	y = canvas_margin + axis_height
	new_label.style.left = `${x}px`;
	new_label.style.top = `${y}px`;
	
	MainCanvas.appendChild(new_label);
	
	canvas = GridLayer
	canvas.beginPath()
	for (let i = 1; i < n_h_grids; i++) {
		canvas.moveTo(x0 + i * x_canvas_interval, y0)
		canvas.lineTo(x1 + i * x_canvas_interval, y1)
		
		new_label = document.createElement('div');
		new_label.className = 'axis_label';
        new_label.innerHTML = i * axis_x_interval
		
		x = axis_label_width / 2 + i * x_canvas_interval
		y = canvas_margin + axis_height
		new_label.style.left = `${x}px`;
		new_label.style.top = `${y}px`;
		
		MainCanvas.appendChild(new_label);
	}
	
	new_label = document.createElement('div');
	new_label.className = 'axis_label';
	new_label.innerHTML = '<b>Temperature (&#176C)</b>'
	
	x = canvas_width / 2 - axis_label_width * 2 + 20
	y = axis_height + canvas_margin * 1.8
	new_label.style.width = `140px`;
	new_label.style.left = `${x}px`;
	new_label.style.top = `${y}px`;
	
	MainCanvas.appendChild(new_label);
	
	for (let i = 1; i < n_v_grids; i++) {
		canvas.moveTo(x1, y1 - i * y_canvas_interval)
		canvas.lineTo(x2, y2 - i * y_canvas_interval)
		
		new_label = document.createElement('div');
		new_label.className = 'axis_label';
        new_label.innerHTML = i * axis_y_interval
		
		x = 0
		y = canvas_margin + axis_height - axis_label_height / 2 - i * y_canvas_interval
		new_label.style.left = `${x}px`;
		new_label.style.top = `${y}px`;
		
		MainCanvas.appendChild(new_label);
	}
	
	new_label = document.createElement('div');
	new_label.className = 'axis_label';
	new_label.innerHTML = '<b>Sales (kg)</b>'
	
	x = -20
	y = -20
	new_label.style.width = `120px`;
	new_label.style.left = `${x}px`;
	new_label.style.top = `${y}px`;
	
	MainCanvas.appendChild(new_label);
	
	canvas.lineWidth = 1; 
	canvas.strokeStyle = "#eeeeee"
	//canvas.stroke()
}

function initialize_equation_position () {
	equation0.style.left = `${equation0_x}px`;
	equation0.style.top = `${equation0_y}px`;
	
	equation1.style.left = `${equation1_x}px`;
	equation1.style.top = `${equation1_y}px`;
	
	equation_next_x = equation1_x + 60
	equation2.style.left = `${equation_next_x}px`;
	equation2.style.top = `${equation1_y}px`;
	
	equation_next_x = equation_next_x + 30
	slope_sign.style.left = `${equation_next_x}px`;
	slope_sign.style.top = `${equation1_y}px`;
	
	equation_next_x = equation_next_x + 20
	slope_value.style.left = `${equation_next_x}px`;
	slope_value.style.top = `${equation1_y}px`;
	
	equation_next_x = equation_next_x + 50
	equation3.style.left = `${equation_next_x}px`;
	equation3.style.top = `${equation1_y}px`;
	
	equation_next_x = equation_next_x + 30
	equation4.style.left = `${equation_next_x}px`;
	equation4.style.top = `${equation1_y}px`;
	
	equation_next_x = equation_next_x + 120
	intercept_sign.style.left = `${equation_next_x}px`;
	intercept_sign.style.top = `${equation1_y}px`;
	
	equation_next_x = equation_next_x + 30
	intercept_value.style.left = `${equation_next_x}px`;
	intercept_value.style.top = `${equation1_y}px`;
}

function axis_to_canvas(axis_coordinates) {
	axis_x = axis_coordinates[0]
	axis_y = axis_coordinates[1]
	canvas_x = canvas_margin + axis_x / axis_x_scale * axis_width
	canvas_y = canvas_height - canvas_margin - axis_y / axis_y_scale * axis_height
	return [canvas_x, canvas_y]
}

function canvas_to_axis(canvas_coordinates) {
	canvas_x = canvas_coordinates[0]
	canvas_y = canvas_coordinates[1]
	axis_x = (canvas_x - canvas_margin) * axis_x_scale / axis_width
	axis_y = - (canvas_y - canvas_height + canvas_margin) * axis_y_scale / axis_height
	return [axis_x, axis_y]
}

function set_canvas_limit() {
	upper_limit = axis_to_canvas([axis_x_scale, axis_y_scale])
	lower_limit = axis_to_canvas([0, 0])
	canvas_limit = [upper_limit[1], lower_limit[1], lower_limit[0], upper_limit[0]]
}

function get_point_anchor(canvas_coordinates, point_size) {
	x = canvas_coordinates[0] - point_size / 2 - 1.7
	y = canvas_coordinates[1] - point_size / 2 - 1.5
	return [x, y]
}

function initialize_control_points() {
	for (let i = 0; i < 2; i++) {
		element_id = control_point_names[i]
		element = document.getElementById(element_id)
		
		element.style.width = `${control_point_size}px`
		element.style.height = `${control_point_size}px`
		
		axis_coordinates = control_point_axis_coordinates[element_id]
		canvas_coordinates = axis_to_canvas(axis_coordinates)
		point_anchor = get_point_anchor(canvas_coordinates, control_point_size)
		
		point_anchor_x = point_anchor[0]
		point_anchor_y = point_anchor[1]
		
		control_point_canvas_coordinates[element_id] = canvas_coordinates
		control_point_anchors[element_id] = point_anchor
		
		element.style.left = `${point_anchor_x}px`;
		element.style.top = `${point_anchor_y}px`;
	}
}

function get_random_error(std) {
	let u = 0, v = 0
	while(u === 0) u = Math.random()
	while(v === 0) v = Math.random()
	let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
	num = num / 10.0 * 8 * std
	return num
}

function generate_data_point() {
	//random_x = Math.floor((15 + Math.random() * 25) * 10) / 10
	random_x = 15 + 3 * data_points.length
	random_y = random_x * actual_slope + actual_intercept
	random_error = get_random_error(error_std)
	
	output = [random_x, Math.floor((random_y + random_error) * 10) / 10]
	return output
}

function initialize_data_points() {
	for (let i = 0; i < n_initial_data_points; i++) {
		new_data_point = generate_data_point()
		
		data_points.push(new_data_point)
		predictions.push("-")
		
		sum_y = sum_y + new_data_point[1]
	}
	mean_y = sum_y / n_initial_data_points
}

function initialize_mean_line() {
	canvas = MeanLayer
	
	canvas_point1 = axis_to_canvas([0, mean_y])
	canvas_point2 = axis_to_canvas([50, mean_y])
	
	canvas.beginPath()
	canvas.moveTo(canvas_point1[0], canvas_point1[1])
	canvas.lineTo(canvas_point2[0], canvas_point2[1])
	
	canvas.lineWidth = 1; 
	canvas.strokeStyle = "#aaaaaa"
	canvas.stroke()
	
	canvas.beginPath()
	canvas.moveTo(660, 170)
	canvas.lineTo(680, 170)
	
	canvas.lineWidth = 3; 
	canvas.strokeStyle = "#0000ff"
	canvas.stroke()
	
	canvas.beginPath()
	canvas.moveTo(660, 210)
	canvas.lineTo(680, 210)
	
	canvas.lineWidth = 3; 
	canvas.strokeStyle = "#00ff00"
	canvas.stroke()
	
	canvas.beginPath()
	canvas.moveTo(660, 250)
	canvas.lineTo(680, 250)
	
	canvas.lineWidth = 3; 
	canvas.strokeStyle = "#ff0000"
	canvas.stroke()
}

function update_data_points() {
	var max_points = 9
	if (game_end) {
		var max_points = max_points + 1
	}
	
	for (let i = n_dp_rows; i < data_points.length; i++) {
		data_point = document.createElement('div');
		data_point.className = 'dp';
		
		axis_coordinates = data_points[i]
		canvas_coordinates = axis_to_canvas(axis_coordinates)
		point_anchor = get_point_anchor(canvas_coordinates, data_point_size)
		
		point_anchor_x = point_anchor[0]
		point_anchor_y = point_anchor[1]
		
		data_point.style.left = `${point_anchor_x}px`;
		data_point.style.top = `${point_anchor_y}px`;
		
		MainCanvas.appendChild(data_point);
		
		n_dp_rows = n_dp_rows + 1
	}
}

function update_regression_line() {
	canvas = LineLayer
	canvas.clearRect(0, 0, LineCanvas.width, LineCanvas.height)
	
	cp1 = control_point_axis_coordinates['control_point1']
	cp2 = control_point_axis_coordinates['control_point2']
	
	slope = (cp2[1] - cp1[1]) / (cp2[0] - cp1[0])
	intercept = cp1[1] - slope * cp1[0]
	
	if (intercept > axis_y_scale) {
		axis_point1 = [(axis_y_scale - intercept) / slope, axis_y_scale]
	} else if (intercept < 0) {
		axis_point1 = [(0 - intercept) / slope, 0]
	} else {
		axis_point1 = [0, intercept]
	}
	
	if (slope * axis_x_scale + intercept > axis_y_scale) {
		axis_point2 = [(axis_y_scale - intercept) / slope, axis_y_scale]
	} else if (slope * axis_x_scale + intercept < 0) {
		axis_point2 = [(0 - intercept) / slope, 0]
	} else {
		axis_point2 = [axis_x_scale, slope * axis_x_scale + intercept]
	}
	
	canvas_point1 = axis_to_canvas(axis_point1)
	canvas_point2 = axis_to_canvas(axis_point2)
	
	canvas.beginPath()
	canvas.moveTo(canvas_point1[0], canvas_point1[1])
	canvas.lineTo(canvas_point2[0], canvas_point2[1])
	canvas.strokeStyle = "#000000"
	canvas.stroke()
	
	
	if (cp2[0] == cp1[0]) {
		equation3.innerHTML = ''
		equation4.innerHTML = ''
		slope_sign.innerHTML = ''
		slope_value.innerHTML = 'ERROR'
		intercept_sign.innerHTML = ''
		intercept_value.innerHTML = ''
	} else if (cp2[1] == cp1[1]) {
		equation3.innerHTML = ''
		equation4.innerHTML = ''
		slope_sign.innerHTML = Math.abs((Math.floor(cp1[1] * 100)/100)).toString()
		slope_value.innerHTML = ''
		intercept_sign.innerHTML = ''
		intercept_value.innerHTML = ''
	} else {
		equation1.innerHTML = 'Sales'
		equation2.innerHTML = '='
		equation3.innerHTML = '&times;'
		equation4.innerHTML = 'Temperature'
		if (slope < 0) {
			slope_sign.innerHTML = '&minus;'
		} else {
			slope_sign.innerHTML = ''
		}
		slope_value.innerHTML = Math.abs((Math.floor(slope * 100)/100)).toString().substring(0,4)
		
		if (Math.round(intercept, 3) == 0) {
			intercept_sign.innerHTML = ''
			intercept_value.innerHTML = ''
		} else {
			if (intercept < 0) {
				intercept_sign.innerHTML = '&minus;'
			} else {
				intercept_sign.innerHTML = '+'
			}
			intercept_value.innerHTML = Math.abs((Math.floor(intercept * 100)/100)).toString()
		}
	}
}

function update_score() {
	sse = 0
	ssr = 0
	sst = 0
	for (let i = 0; i < data_points.length; i++) {
		x = data_points[i][0]
		y = data_points[i][1]
		yhat = x * slope + intercept
		
		sse = sse + (y - yhat) * (y - yhat)
		ssr = ssr + (mean_y - yhat) * (mean_y - yhat)
		sst = sst + (mean_y - y) * (mean_y - y)
	}
	
	rsq = 1 - sse / sst
	sse_label.innerHTML = Math.floor(sse * 100) / 100
	ssr_label.innerHTML = Math.floor(ssr * 100) / 100
	sst_label.innerHTML = Math.floor(sst * 100) / 100
	rsq_label.innerHTML = (Math.floor(rsq * 10000) / 100).toString() + " %"
}

function update_error() {
	canvas = ErrorLayer
	canvas.clearRect(0, 0, LineCanvas.width, LineCanvas.height)
	
	canvas.beginPath()
	for (let i = 0; i < data_points.length; i++) {
		dp_canvas = axis_to_canvas(data_points[i])
		dp_canvas_x = dp_canvas[0]
		dp_canvas_y = dp_canvas[1]
		
		dp_x = data_points[i][0]
		target_axis_coordinates = [dp_x, Math.max(Math.min(dp_x * slope + intercept, axis_y_scale), 0)]
		target_canvas_coordinates = axis_to_canvas(target_axis_coordinates)
		
		canvas.moveTo(dp_canvas_x-2, dp_canvas_y)
		canvas.lineTo(target_canvas_coordinates[0]-2, target_canvas_coordinates[1])
	}
	canvas.lineWidth = 3; 
	canvas.strokeStyle = "#0000ff"
	canvas.stroke()
	
	canvas.beginPath()
	for (let i = 0; i < data_points.length; i++) {
		dp_canvas = axis_to_canvas(data_points[i])
		dp_canvas_x = dp_canvas[0]
		dp_canvas_y = dp_canvas[1]
		
		dp_x = data_points[i][0]
		target_axis_coordinates = [dp_x, mean_y]
		target_canvas_coordinates = axis_to_canvas(target_axis_coordinates)
		
		canvas.moveTo(dp_canvas_x+2, dp_canvas_y)
		canvas.lineTo(target_canvas_coordinates[0]+2, target_canvas_coordinates[1])
	}
	canvas.lineWidth = 3; 
	canvas.strokeStyle = "#ff0000"
	canvas.stroke()
	
	
	canvas.beginPath()
	for (let i = 0; i < data_points.length; i++) {
		
		dp_x = data_points[i][0]
		
		from_axis_coordinates = [dp_x, mean_y]
		from_canvas_coordinates = axis_to_canvas(from_axis_coordinates)
		
		target_axis_coordinates = [dp_x, Math.max(Math.min(dp_x * slope + intercept, axis_y_scale), 0)]
		target_canvas_coordinates = axis_to_canvas(target_axis_coordinates)
		
		canvas.moveTo(from_canvas_coordinates[0]-2, from_canvas_coordinates[1])
		canvas.lineTo(target_canvas_coordinates[0]-2, target_canvas_coordinates[1])
	}
	canvas.lineWidth = 3; 
	canvas.strokeStyle = "#00ff00"
	canvas.stroke()
}

function drag_update() {
	update_regression_line()
	update_score()
	update_error()
}

function hover_prediction() {
	const canvas_x = event.clientX - page_margin_left
	const canvas_y = event.clientY - page_margin_top
	
	canvas_coordinates = [canvas_x, canvas_y]
	axis_coordinates = canvas_to_axis(canvas_coordinates)
	
	axis_x = axis_coordinates[0]
	axis_y = axis_coordinates[1]
	prediction = axis_x * slope + intercept
	
	if ((axis_x >= 0) &(Math.abs(axis_y - prediction) < 5) & (!isDragging)) {
		display_x = (Math.floor(axis_x * 1000) / 1000).toString().substring(0,5)
		display_y = (Math.floor(prediction * 1000) / 1000).toString().substring(0,5)
		prediction_label.innerHTML = '(' + display_x + ', ' + display_y + ')'
		
		display_canvas_coordinates = axis_to_canvas([axis_x, prediction])
		display_canvas_x = display_canvas_coordinates[0] - 50
		display_canvas_y = display_canvas_coordinates[1] - 40
		
		prediction_label.style.left = `${display_canvas_x}px`;
		prediction_label.style.top = `${display_canvas_y}px`;
		
		prediction_pointer_anchor = get_point_anchor([display_canvas_x + 51, display_canvas_y + 41.5], prediction_pointer_size)
		prediction_pointer_anchor_x = prediction_pointer_anchor[0]
		prediction_pointer_anchor_y = prediction_pointer_anchor[1]
		prediction_pointer.style.left = `${prediction_pointer_anchor_x}px`;
		prediction_pointer.style.top = `${prediction_pointer_anchor_y}px`;
	} else {
		prediction_label.innerHTML = ''
		prediction_label.style.left = `-200px`;
		prediction_label.style.top = `-200px`;
		
		prediction_pointer.style.left = `-200px`;
		prediction_pointer.style.top = `-200px`;
	}
}

function makeDraggable(element) {
	var element_id = element.id
	
    element.addEventListener('mousedown', (event) => {
		const canvas_x0 = event.clientX
		const canvas_y0 = event.clientY
		
		canvas_x1 = Math.max(Math.min(control_point_canvas_coordinates[element_id][0], canvas_limit[3]), canvas_limit[2])
		canvas_y1 = Math.max(Math.min(control_point_canvas_coordinates[element_id][1], canvas_limit[1]), canvas_limit[0])
				
        isDragging = true;

        function onMouseMove(event) {
            if (isDragging) {
				x_delta = event.clientX - canvas_x0
				y_delta = event.clientY - canvas_y0
				
				canvas_x1 = Math.max(Math.min(control_point_canvas_coordinates[element_id][0] + x_delta, canvas_limit[3]), canvas_limit[2])
				canvas_y1 = Math.max(Math.min(control_point_canvas_coordinates[element_id][1] + y_delta, canvas_limit[1]), canvas_limit[0])
				control_point_axis_coordinates[element_id] = canvas_to_axis([canvas_x1, canvas_y1])
				point_anchor = get_point_anchor([canvas_x1, canvas_y1], control_point_size)
				control_point_anchors[element_id] = point_anchor
				point_anchor_x1 = point_anchor[0]
				point_anchor_y1 = point_anchor[1]
				element.style.left = `${point_anchor_x1}px`
				element.style.top = `${point_anchor_y1}px`
				
				drag_update()
            }
        }

        function onMouseUp() {
            isDragging = false;
			control_point_canvas_coordinates[element_id] = [canvas_x1, canvas_y1]
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    });
}

makeDraggable(control_point1);
makeDraggable(control_point2);
