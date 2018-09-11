class Resource {
	constructor(name){
		this.process = []
		this.name = name
		this.current = null
		this.time = 0
	}

	add_process(user, time){
		var p = {user: user, time: time, waiting_time: 0}
		this.process.push(p)
	}

	time_left(){
		for (var i = 0; i < this.process.length; i++){
			if (this.process[i].waiting_time) {
				this.process[i].waiting_time--
			}
		}
		var a = this.process[this.process.length - 1]
		if (a){
			return a.time + a.waiting_time
		}
	}
}


class User {
	constructor(name, color) {
		this.name = name
		this.resources = []
		this.res_time = []
		this.color = color
	}

	request(resource, time){
		resource.add_process(this, time)
		this.resources.push(resource)
		this.res_time.push({time: time, waiting_time: 0})
	}
}

var vue = new Vue({
	el: '#app',
	data: {
		resources: [],
		users: [],
		color: ['#ef9a9a', '#ce93d8', '#9fa8da', '#81d4fa', '#80cbc4', '#c5e1a5', '#fff59d', '#ffcc80', '#bcaaa4', 
				 '#e53935', '#e53935', '#3949ab', '#039be5', '#00897b', '#7cb342', '#fdd835', '#fb8c00', '#6d4c41',
				 '#ff5252', '#e040fb', '#536dfe', '#40c4ff', '#64ffda', '#ffab40',  '#c51162', '#6200ea', '#2962ff',
				 '#00b8d4', '#00c853', '#aeea00', '#cfd8dc'],
		num: 30,
	},
	methods: {
		initialize: function () {
			var res_count = this.random()
			var user_count = this.random()
			for (var i= 1; i <= res_count; i++){
				this.resources.push(new Resource(i))
			}
			var res_list = this.resources.slice(0)	
			for (var i = 1; i <= user_count; i++){
				var u = new User(i, this.color[i])
				this.users.push(u)
				var user_res = res_list.sort(() => .5 - Math.random()).slice(0, this.random())
				user_res = user_res.sort(this.resource_sort)
				user_res.forEach((res) => {
					u.request(res, this.random())
				})
			}
			for (var i = 0; i < res_count; i++){
				var res = this.resources[i]
				var ps = res.process.sort(this.user_resource_sort)
				//init waiting time
				for (var j = 0; j < ps.length; j++){
					var p = ps[j]
					var user = p.user
					var index = user.resources.indexOf(res)
					var value = 0
					if (index - 1>= 0){
						var t = user.res_time[index -1]
						value = t.time + t.waiting_time
					}
					user.res_time[index].waiting_time = value
					p.waiting_time = value
				}
				ps.sort(this.process_sort)
				var prev = 0
				for (var j = 0; j < ps.length; j++){
					var p = ps[j]
					var user = p.user
					var index = user.resources.indexOf(res)
					var value = p.waiting_time > prev ? p.waiting_time:prev
					p.waiting_time = value
					user.res_time[index].waiting_time = value
					prev = value + p.time
				}
			}
			this.display()
		},
		available: function(resource) {
			var array = resource.process
			for (var i = 0; i < array.length; i++){
				var user = array[i].user
				if (user.resources[0] == resource && (resource.current == null || resource.current == array[i])) { 
					return array[i]
				} 
			}
			return null
		},
		update: function () {
			for (var i = 0; i < this.resources.length; i++){
				var res = this.resources[i]
				var p = this.available(res)
				if (p && p['time'] == 0) {
					p.user.resources.shift()
					p.user.res_time.shift()
					if (res.process.indexOf(p)!= 0){
						alert('ERROR')
					} 
					res.process.splice(0, 1)
					res.current = null
					p = this.available(res)
				}
				if (p) {
					console.log('Resoure: ', i + 1, ', User: ', p.user.name)
					res.current = p
					p.time--
					p.user.res_time[0].time--
					this.tick(i, p.time)
				} 
				res.time = res.time_left()
			}
			// this.display()
		},
		display_queue: function (r) {
			var queue = document.getElementById('queue-' + r.name)
			var detail = document.getElementById('detail-' + r.name)
			var icon = document.getElementById('icon-' + r.name)
			if (icon.innerHTML == 'arrow_drop_down'){
				icon.innerHTML = 'arrow_drop_up'
				detail.style = "display: none;"
				queue.style = "display: block;"
			} else {
				icon.innerHTML = 'arrow_drop_down'
				detail.style = "display: block;"
				queue.style = "display: none;"
			}

		},
		tick: function (index, time) {
			var color = time < 5 ? 'red;':'blue;'
			var size = 113 - (113 / this.num) * time;
			var el_name = 'circle-' + (index + 1)
			var element = document.getElementById(el_name)
			if (element){
				element.style = "stroke-dashoffset:" + size + "px; stroke:" + color;				
			}
		},
		display: function () {
			for (var i = 0; i < this.resources.length; i++){
				var p = this.resources[i].process
				console.log('========Resource ', i + 1, '==============')
				for (var x = 0; x < p.length; x++){
					console.log(p[x]['user'].name, p[x]['time'], p[x]['waiting_time'])
				}
				console.log('==================================')

				console.log('\n')
			}
		}, 
		user_resource_sort: function (a, b) {
			var x = a.user.name
			var y = b.user.name
			return x - y
		},
		resource_sort: function (a, b) {
			var x = a.name
			var y = b.name
			return x - y
		},
		process_sort: function(a, b) {
			var x = a.waiting_time
			var y = b.waiting_time
			if (x-y == 0){
				var x = a.user.name
				var y = b.user.name
				return x - y
			}
			return x - y
		},
		random: function() {
			return  Math.floor(Math.random() * this.num + 1)
		},
	}
})
vue.initialize()

setInterval(function(){
  	vue.update();
}, 1500);vue.update()





