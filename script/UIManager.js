var stringDate = function(mil) {
	var milInMinute = 1000 * 60;
	var milInHour = milInMinute * 60;
	var milInDay = milInHour * 24;
	var milInMonth = milInDay * 30;

	if(mil < milInMinute) return "Few Seconds Ago";
	if(mil < milInHour) return "Few Minutes Ago";
	if(mil < milInDay) return "Few Hours Ago";
	if(mil < milInMonth) return "Few Days Ago";
}


var showFeed = function(id, data) {
	data = JSON.parse(data);

	feeds[id].description = data.channel.description;
	feeds[id].image = data.channel.image.url;

	obj.build(data.channel.item);
}

var hideLoader = function() {
	$("#feedLoader").hide();
}

var showLoader = function() {
	$("#feedLoader").show();
}

var showInfo = function() {
	$("#feedInfo").show();
	$("#feedInfo").addClass("show");
	$("#feedContainer").addClass("shrink");
}

var hideInfo = function() {
	$("#feedInfo").hide();
	$("#feedInfo").removeClass("show");
	$("#feedContainer").removeClass("shrink");
}

var UI = function() {

	this.holder = $("#feeds");
	this.sideBar = $("#sidebar");

	var item = function(title, description, time, link) {
		var feed = $("<div/>", {
			class: "feed"
		});

		$("<a/>", {
			target: "_blank",
			href: link
		}).append(
			$("<h3 />", {
				class: "title",
				text: title
			})
		).appendTo(feed);

		time = new Date(time);

		$("<i />", {
			class: "date",
			text: stringDate(currentTime() - time)
		}).appendTo(feed);

		return feed;
	}

	var buildInfo = function(id) {
		var title = $("#feedTitle");
		var subTitle = $("#feedSubTitle");
		var updateInterval = $("#feedUpdateInterval");
		var autoUpdate = $("#settingToggle .toggle");
		var image = $("#feedImg img");
		var rbutton = $("#deleteFeed");

		title.html(feeds[id].title);
		subTitle.html(feeds[id].description);

		var duration = feeds[id].interval;
		var string = "";
		if(duration < 1000) string = duration + " milliseconds";
		else if(duration < 60000) string = (duration / 1000) + " seconds";
		else if(duration < 3600000) string = (duration / 60000) + " minutes";
		else string = (duration / 3600000) + " hours";

		updateInterval.html(string);

		image.attr("src", feeds[id].image);

		autoUpdate.removeClass("on");
		autoUpdate.removeClass("off");

		feeds[id].autoUpdate ? autoUpdate.addClass("on") : autoUpdate.addClass("off");

		autoUpdate.data("id", id);
		rbutton.data("id", id);
	}

	var showSettings = function(id) {
		buildInfo(id);

		if($("#feedInfo").hasClass("show")) {
			hideInfo();
		} else {
			showInfo();
		}
	}

	this.init = function(button, inputScreen) {

		button.click(function() {
			$(inputScreen).show();
		});
	}

	this.sidebarNavItem = function(title, id) {
		var h = $("<div/>", {
			class: "rssid",
			"data-id": id
		});

		$("<img/>", {
			class: "circle_img",
			src: feeds[id].image
		}).appendTo(h);

		$("<span/>", {
			text: title
		}).appendTo(h);

		var settings = $("<i/>");
		settings.appendTo(h);

		settings.click(function() {
			showSettings(id);
		});

		$("#sidebar").append(h);

		$(".rssid").removeClass("selected");
		h.addClass("selected");
		
		currentFeed = id;

		h.click(function() {
			$(".rssid").removeClass("selected");
			$(this).addClass("selected");
			currentFeed = id;
			fetchFeed(id);
		});
	}

	this.build = function(feeds) {
		$(this.holder).html('');

		for(feed of feeds) {
			this.holder.append(item(feed.title, feed.description, feed.pubDate, feed.link));
		}
	}

}

var obj = new UI();

var addNewFeed = function(name, url) {
	var id = add(name, url);

	obj.sidebarNavItem(name, id);
}

$(function() {
	obj.init($("#addFeed"), $("#feedInput"));

	$("#feedInputSubmit").submit(function(e) {
		var name = $("#feedName").val();
		var url = $("#feedURL").val();

		console.log(name, url);
		if(name == "" || url == "") return false;

		hideInfo();

		$("#feedName").val('');
		$("#feedURL").val('');

		addNewFeed(name, url);

		$("#feedInput").hide();

		e.preventDefault();
	});

	$(".toggle").click(function() {
		var id = $(this).data('id');
		if(toggleAutoUpdate(id)) {
			// turned off
			$(this).removeClass("on");
			$(this).addClass("off");
		} else {
			// turned on
			$(this).addClass("on");
			$(this).removeClass("off");
		}

	});

	$("#deleteFeed").click(function() {
		var id = $(this).data('id');
		remove(id);
		hideInfo();
	});

	$("#closeInputForm").click(function() {
		$("#feedInput").hide();
	});


	// add predefined cnn feeds
	addNewFeed("Top Stories", "http://rss.cnn.com/rss/edition.rss");
	addNewFeed("Technology", "http://rss.cnn.com/rss/edition_technology.rss");
	addNewFeed("Entertainment", "http://rss.cnn.com/rss/edition_entertainment.rss");
});

