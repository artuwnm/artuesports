//Carousel
function Carousel(el) {

	let carousel = this;
	
	carousel.element = $(el);
	carousel.currentslide = 0;
	carousel.previousSlide = 0;
	carousel.numberOfSlides = 0;

	carousel.timer = false;
	carousel.timerLength = 5000;
	carousel.timerPause = 10000;
	carousel.timing = false;

	carousel.changePosition = function(direction) {
		if(carousel.timing) return;

		carousel.previousSlide = carousel.currentslide;

		if(direction === false) {
			carousel.currentslide--;
		} else
		if(direction === true) {
			carousel.currentslide++;
		} else {
			if(carousel.currentslide < direction) {
				carousel.currentslide = direction;

				return carousel.showPosition(true,true);
			} else if(carousel.currentslide > direction){
				carousel.currentslide = direction;
				return carousel.showPosition(false,true);
			}
		}
		
		if (carousel.currentslide == carousel.previousSlide) return;
		if (carousel.currentslide < 0) {
  		  carousel.currentslide = carousel.numberOfSlides - 1;
		} else if (carousel.currentslide >= carousel.numberOfSlides) {
   	 carousel.currentslide = 0;
		}

		carousel.showPosition(direction,false);
	}

	carousel.showPosition = function(direction,placed) {
		clearTimeout(carousel.changeTimer);
		carousel.changeTimer = false;

		let leftposition, rightposition;
		if(carousel.currentslide == 0){
			leftposition = carousel.numberOfSlides-1;
		} else leftposition = carousel.currentslide-1;

		if(carousel.currentslide == carousel.numberOfSlides-1){
			rightposition = 0;
		} else rightposition = carousel.currentslide+1;

		let cs = carousel.element.find(".carousel-slide")
			.removeClass("atLeft atRight atCenter moving");

		cs.eq(carousel.previousSlide).addClass("atCenter");
		if(direction===true){
			cs.eq(carousel.currentslide).addClass("atRight");
			cs.eq(rightposition).addClass("atRight");
		} else if(direction===false){
			cs.eq(carousel.currentslide).addClass("atLeft");
			cs.eq(leftposition).addClass("atLeft");
		}
		carousel.timing = true; 

		carousel.changeTimer = setTimeout(function(){
			carousel.element.find(".carousel-paginate")
			.eq(carousel.currentslide).addClass("active")
			.siblings().removeClass("active");
		cs.eq(carousel.currentslide).removeClass("atLeft atRight").addClass("moving atCenter");
		cs.eq(carousel.previousSlide).removeClass("atLeft atRight atCenter").addClass("moving at" +
   	 (direction === true ? "Left" : "Right"));


		setTimeout(function(){carousel.timing = false;}, 900);
		},50);
	}

	carousel.startTimer = function(){
		if(carousel.timerLength === 0) return;
		carousel.timer = setInterval(carousel.tick, carousel.timerLength);
	}

	carousel.stopTimer = function(){
		clearInterval(carousel.timer);
		carousel.timer = false;
	}

carousel.pauseTimer = function () {
    clearTimeout(carousel.timer);
    carousel.stopTimer();
    carousel.timer = setTimeout(carousel.startTimer, carousel.timerPause);
};


	carousel.tick = function(){
		carousel.changePosition(true);
	}

	carousel.makeButtons = function(){
		let buttondiv = $("<div class='carousel-pagination'>");

		for(let i=0; i<carousel.numberOfSlides; i++) {
			let btn = $("<button class='carousel-paginate'>");

			if(i==0) btn.addClass("active");

			buttondiv.append(btn);
		}
		carousel.element.find(".carousel-pagination-wrapper").append(buttondiv);
	}
	carousel.init = function(){
		if(carousel.element.data("timer")=="none"){
			carousel.timerLength = 0;
		} else if(carousel.element.data("timer")!==undefined) {
			carousel.timerLength = +carousel.element.data("timer")*1000;
		}
		carousel.timerPause = carousel.timerLength*2;

		carousel.numberOfSlides = carousel.element.find(".carousel-slide").length;
		carousel.element.find(".carousel-slide").eq(0).addClass("active atCenter");
		carousel.makeButtons();
		carousel.startTimer();
	}
	carousel.element.on("click",".carousel-arrow",function(){
		carousel.changePosition($(this).is(".carousel-arrow-right"));
		carousel.pauseTimer();
	})
	carousel.element.on("click",".carousel-paginate", function(){
		carousel.changePosition($(this).index());
		carousel.pauseTimer();
	})

	carousel.init();
}
$(function(){
	$(".carousel").each(function(){
		new Carousel(this);
	})
})




// Dropdown Menu Toggle
$(function(){
	let dropdownTimeout;
	
	// Show dropdown on hover with delay
	$(".nav-dropdown").on("mouseenter", function(){
		clearTimeout(dropdownTimeout);
		$(this).addClass("active");
	});
	
	// Hide dropdown on mouse leave with small delay
	$(".nav-dropdown").on("mouseleave", function(){
		const $dropdown = $(this);
		dropdownTimeout = setTimeout(function(){
			$dropdown.removeClass("active");
		}, 150); // Small delay to allow mouse movement
	});
	
	// Allow the main link to navigate normally
	$(".nav-dropdown .nav-item").on("click", function(e){
		// Allow normal navigation
	});
	
	// Toggle dropdown on click (for mobile/touch)
	$(".nav-dropdown").on("click", function(e){
		if($(e.target).hasClass("nav-item")) {
			// Allow the link to work - don't prevent default
			return;
		}
		$(this).toggleClass("active");
	});
	
	// Close dropdown when clicking outside
	$(document).on("click", function(e){
		if(!$(e.target).closest(".nav-dropdown").length) {
			$(".nav-dropdown").removeClass("active");
		}
	});
	
	// Prevent dropdown from closing when clicking inside it
	$(".dropdown-menu").on("click", function(e){
		e.stopPropagation();
	});
});

//Slideshow (only runs if elements exist)
$(function(){
	if($(".slideshow-captions-all").length > 0) {
		let currentslidenumber = 0;
		$(".slideshow-captions-all div").eq(0).show().siblings().hide();

		$(".arrow-next").on("click",function(){
			currentslidenumber++;
			if(currentslidenumber>5) {
				currentslidenumber=0;
			}
			slideShow();
		})
		$(".arrow-prev").on("click",function(){
			currentslidenumber--;
			if(currentslidenumber<0){
				currentslidenumber=5;
			}
			slideShow();
		})
		function slideShow() {
			let calculation = -800*currentslidenumber;
			$(".slideshow-images").animate({marginLeft:calculation},1000);
			$(".slideshow-captions-all div").eq(currentslidenumber).show().siblings().hide();
		}
	}
})

// Navigation Active State Management
$(function(){
	// Get current page filename, handling various URL formats
	let currentPage = window.location.pathname.split('/').pop();
	
	// Handle cases where there's no filename (root/index)
	if (!currentPage || currentPage === '') {
		currentPage = 'index.html';
	}
	
	// Remove query strings and hash if present
	currentPage = currentPage.split('?')[0].split('#')[0];
	
	// Remove active class from all nav items first
	$('.nav-item').removeClass('active');
	
	// Map of page files to their corresponding nav links
	const pageMap = {
		'index.html': null, // Home page - no active nav item
		'team.html': 'team.html',
		'lounge.html': 'lounge.html',
		'knightarcade.html': 'lounge.html', // Knight Arcade is under Lounge dropdown
		'boardgameroom.html': 'lounge.html', // Board Game Room is under Lounge dropdown
		'events.html': 'events.html',
		'connect.html': 'connect.html',
		'privacy.html': null,
		'admin.html': null,
		'admin-login.html': null,
		'events-admin.html': null
	};
	
	// Find the nav link that should be active
	const activeLink = pageMap[currentPage];
	
	if (activeLink) {
		// Find and activate the matching nav link
		$('.nav-item[href="' + activeLink + '"]').addClass('active');
	}
});

// Event Filter Functionality
$(function(){
	// Handle filter button clicks
	$(".events-filter-chip").on("click", function(){
		const $button = $(this);
		const filterValue = $button.text().trim().toLowerCase();
		
		// Remove active class from all buttons
		$(".events-filter-chip").removeClass("is-active");
		
		// Add active class to clicked button
		$button.addClass("is-active");
		
		// Get all event cards in the main events grid (not recaps)
		const $eventCards = $(".events-grid .event-card");
		
		// Remove filtered-out class from all cards first
		$eventCards.removeClass("filtered-out");
		
		// Filter based on button text
		if (filterValue === "all") {
			// Show all cards - already done by removing filtered-out class
		} else if (filterValue === "esports") {
			// Hide community cards, show esports cards
			$eventCards.each(function(){
				const $card = $(this);
				const category = $card.attr("data-event-category");
				if (category !== "esports") {
					$card.addClass("filtered-out");
				}
			});
		} else if (filterValue === "community events") {
			// Hide esports cards, show community cards
			$eventCards.each(function(){
				const $card = $(this);
				const category = $card.attr("data-event-category");
				if (category !== "community") {
					$card.addClass("filtered-out");
				}
			});
		}
	});
});

// Event Overlay Functionality
$(function(){
	const $overlay = $("#event-overlay");
	const $closeBtn = $("#event-overlay-close");
	const $eventCards = $(".event-card");
	
	// Function to parse date string and extract date and time
	function parseEventDate(dateString) {
		// Format: "Thursday, October 12th | 10/16/25" or "10/16/25 | 3:00pm"
		const parts = dateString.split("|").map(p => p.trim());
		let date = "";
		let time = "";
		
		// Look for date pattern (MM/DD/YY or MM/DD/YYYY)
		const dateMatch = dateString.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
		if (dateMatch) {
			date = dateMatch[1];
		}
		
		// Look for time pattern (H:MMam/pm or HH:MMam/pm)
		const timeMatch = dateString.match(/(\d{1,2}:\d{2}\s*(am|pm|AM|PM))/i);
		if (timeMatch) {
			time = timeMatch[1].toLowerCase().replace(/\s/g, "");
		} else {
			// Default time if not found
			time = "3:00pm";
		}
		
		// If no date found, use a default
		if (!date) {
			date = "10/22/2025";
		}
		
		return { date, time };
	}
	
	// Function to get subheading based on category
	function getSubheading(category) {
		if (category === "esports") {
			return "Esports event";
		} else if (category === "community") {
			return "In person contest";
		}
		return "Event";
	}
	
	// Function to open overlay with event data
	function openOverlay($card) {
		// Get event data from card
		const title = $card.find(".event-card-title").text().trim();
		const description = $card.find(".event-card-description").text().trim();
		const dateString = $card.find(".event-card-date").text().trim();
		const category = $card.attr("data-event-category") || "";
		const $cardImage = $card.find(".event-card-image");
		
		// Parse date and time
		const { date, time } = parseEventDate(dateString);
		
		// Get subheading based on category
		const subheading = getSubheading(category);
		
		// Populate overlay
		$("#event-overlay-title").text(title);
		$("#event-overlay-subheading").text(subheading);
		$("#event-overlay-description").text(description);
		$("#event-overlay-date").text(date);
		$("#event-overlay-time").text(time);
		
		// Copy image if it exists
		const $overlayImage = $("#event-overlay-image");
		$overlayImage.empty();
		
		// Try to get background image or image source
		const cardImageBg = $cardImage.css("background-image");
		if (cardImageBg && cardImageBg !== "none") {
			$overlayImage.css("background-image", cardImageBg);
			$overlayImage.css("background-size", "cover");
			$overlayImage.css("background-position", "center");
		} else {
			// Use placeholder background
			$overlayImage.css("background-image", "none");
			$overlayImage.css("background-color", "var(--color-placeholder)");
		}
		
		// Show overlay
		$overlay.addClass("is-open");
		// Prevent body scroll when overlay is open
		$("body").css("overflow", "hidden");
	}
	
	// Function to close overlay
	function closeOverlay() {
		$overlay.removeClass("is-open");
		$("body").css("overflow", "");
	}
	
	// Handle event card clicks - only on cards in the events grid (not recaps)
	$(".events-grid .event-card").on("click", function(e) {
		e.preventDefault();
		e.stopPropagation();
		const $card = $(this);
		// Don't open if card is filtered out
		if (!$card.hasClass("filtered-out")) {
			openOverlay($card);
		}
	});
	
	// Handle close button click
	$closeBtn.on("click", function(e) {
		e.preventDefault();
		closeOverlay();
	});
	
	// Handle overlay background click (close overlay) - only when clicking directly on overlay background
	$overlay.on("click", function(e) {
		// Only close if clicking directly on the overlay element itself (not on children)
		if ($(e.target).is($overlay)) {
			closeOverlay();
		}
	});
	
	// Prevent content clicks from bubbling up and closing overlay
	$(".event-overlay-content, .event-overlay-close").on("click", function(e) {
		e.stopPropagation();
	});
	
	// Handle Escape key to close overlay
	$(document).on("keydown", function(e) {
		if (e.key === "Escape" && $overlay.hasClass("is-open")) {
			closeOverlay();
		}
	});
	
	// Handle calendar button click
	$("#event-overlay-calendar-btn").on("click", function(e) {
		e.preventDefault();
		// Get event details for calendar
		const title = $("#event-overlay-title").text();
		const date = $("#event-overlay-date").text();
		const time = $("#event-overlay-time").text();
		const description = $("#event-overlay-description").text();
		
		// Create Google Calendar URL
		// Parse the date (assuming format MM/DD/YYYY or MM/DD/YY)
		const dateParts = date.split("/");
		let year = dateParts[2];
		if (year.length === 2) {
			year = "20" + year;
		}
		const month = dateParts[0].padStart(2, "0");
		const day = dateParts[1].padStart(2, "0");
		
		// Parse time (assuming format H:MMam/pm)
		const timeMatch = time.match(/(\d{1,2}):(\d{2})(am|pm)/i);
		let hour = 15; // Default to 3pm
		let minute = 0;
		if (timeMatch) {
			hour = parseInt(timeMatch[1]);
			minute = parseInt(timeMatch[2]);
			const ampm = timeMatch[3].toLowerCase();
			if (ampm === "pm" && hour !== 12) {
				hour += 12;
			} else if (ampm === "am" && hour === 12) {
				hour = 0;
			}
		}
		
		// Create start datetime (ISO 8601 format)
		const startDate = new Date(`${year}-${month}-${day}T${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`);
		const endDate = new Date(startDate);
		endDate.setHours(endDate.getHours() + 2); // Default 2 hour event
		
		const startStr = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
		const endStr = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
		
		// Build Google Calendar URL
		const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(description)}`;
		
		// Open in new tab
		window.open(calendarUrl, "_blank");
	});
});