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
			// Update active state and distance classes
			let paginateButtons = carousel.element.find(".carousel-paginate");
			paginateButtons.removeClass("active");
			paginateButtons.eq(carousel.currentslide).addClass("active");
			
			// Update distance-based colors
			carousel.updatePaginationColors();
			
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

			if(i==0) {
				btn.addClass("active");
			}

			buttondiv.append(btn);
		}
		carousel.element.find(".carousel-pagination-wrapper").append(buttondiv);
		// Set initial distance classes
		carousel.updatePaginationColors();
	}
	
	carousel.updatePaginationColors = function(){
		let paginateButtons = carousel.element.find(".carousel-paginate");
		paginateButtons.removeClass("distance-1 distance-2 distance-3 distance-4");
		
		for(let i = 0; i < paginateButtons.length; i++) {
			if(i !== carousel.currentslide) {
				// Calculate position relative to active indicator
				// Pattern: active is red, then gradient based on position
				let forwardDist = (i - carousel.currentslide + carousel.numberOfSlides) % carousel.numberOfSlides;
				let backwardDist = (carousel.currentslide - i + carousel.numberOfSlides) % carousel.numberOfSlides;
				
				// Use the minimum distance, but apply different colors based on direction
				// For page 1 (index 0): forward gradient
				// For page 2 (index 1): special pattern
				if(carousel.currentslide === 0) {
					// Page 1: forward gradient
					if(forwardDist === 1) {
						paginateButtons.eq(i).addClass("distance-1");
					} else if(forwardDist === 2) {
						paginateButtons.eq(i).addClass("distance-2");
					} else if(forwardDist === 3) {
						paginateButtons.eq(i).addClass("distance-3");
					} else if(forwardDist >= 4) {
						paginateButtons.eq(i).addClass("distance-4");
					}
				} else if(carousel.currentslide === 1) {
					// Page 2: special pattern (active is index 1, second from left)
					// Very left (index 0): rgba(217, 217, 217, 0.40)
					// Second from left (index 1): red (active, handled separately)
					// Middle (index 2): #D9D9D9
					// 2nd from right (index 3): rgba(217, 217, 217, 0.80)
					// Very right (index 4): rgba(217, 217, 217, 0.60)
					if(i === 0) {
						paginateButtons.eq(i).addClass("distance-4"); // very left: 0.40
					} else if(i === 2) {
						paginateButtons.eq(i).addClass("distance-1"); // middle: #D9D9D9
					} else if(i === 3) {
						paginateButtons.eq(i).addClass("distance-2"); // 2nd from right: 0.80
					} else if(i === 4) {
						paginateButtons.eq(i).addClass("distance-3"); // very right: 0.60
					}
				} else if(carousel.currentslide === 2) {
					// Page 3: special pattern (active is index 2, middle)
					// Very left (index 0): rgba(217, 217, 217, 0.60)
					// Second from left (index 1): rgba(217, 217, 217, 0.40)
					// Middle (index 2): red (active, handled separately)
					// 2nd from right (index 3): #D9D9D9
					// Very right (index 4): rgba(217, 217, 217, 0.80)
					if(i === 0) {
						paginateButtons.eq(i).addClass("distance-3"); // very left: 0.60
					} else if(i === 1) {
						paginateButtons.eq(i).addClass("distance-4"); // second from left: 0.40
					} else if(i === 3) {
						paginateButtons.eq(i).addClass("distance-1"); // 2nd from right: #D9D9D9
					} else if(i === 4) {
						paginateButtons.eq(i).addClass("distance-2"); // very right: 0.80
					}
				} else {
					// For other pages, use forward distance
					if(forwardDist === 1) {
						paginateButtons.eq(i).addClass("distance-1");
					} else if(forwardDist === 2) {
						paginateButtons.eq(i).addClass("distance-2");
					} else if(forwardDist === 3) {
						paginateButtons.eq(i).addClass("distance-3");
					} else if(forwardDist >= 4) {
						paginateButtons.eq(i).addClass("distance-4");
					}
				}
			}
		}
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




// Dropdown Menu Toggle (Desktop only)
$(function(){
	// Check if we're on desktop (not tablet/mobile)
	function isDesktop() {
		return window.innerWidth > 1024;
	}
	
	let dropdownTimeout;
	
	// Show dropdown on hover with delay (desktop only)
	$(".nav-dropdown").on("mouseenter", function(){
		if (!isDesktop()) return;
		clearTimeout(dropdownTimeout);
		$(this).addClass("active");
	});
	
	// Hide dropdown on mouse leave with small delay (desktop only)
	$(".nav-dropdown").on("mouseleave", function(){
		if (!isDesktop()) return;
		const $dropdown = $(this);
		dropdownTimeout = setTimeout(function(){
			$dropdown.removeClass("active");
		}, 150); // Small delay to allow mouse movement
	});
	
	// Allow the main link to navigate normally
	$(".nav-dropdown .nav-item").on("click", function(e){
		// Allow normal navigation
	});
	
	// Toggle dropdown on click (desktop only - mobile uses hamburger menu)
	$(".nav-dropdown").on("click", function(e){
		if (!isDesktop()) return;
		if($(e.target).hasClass("nav-item")) {
			// Allow the link to work - don't prevent default
			return;
		}
		$(this).toggleClass("active");
	});
	
	// Close dropdown when clicking outside (desktop only)
	$(document).on("click", function(e){
		if (!isDesktop()) return;
		// Don't close dropdown if clicking hamburger button
		if ($(e.target).closest(".hamburger-menu-btn").length > 0) {
			return;
		}
		if(!$(e.target).closest(".nav-dropdown").length) {
			$(".nav-dropdown").removeClass("active");
		}
	});
	
	// Prevent dropdown from closing when clicking inside it (desktop only)
	$(".dropdown-menu").on("click", function(e){
		if (!isDesktop()) return;
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
		'overwatch.html': 'teams.html',
		'teams.html': 'teams.html',
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
$(document).ready(function(){
	console.log("Event filter script loaded");
	
	// Wait a bit to ensure DOM is fully ready
	setTimeout(function() {
		// Try both direct binding and event delegation
		const $filterButtons = $(".events-filter-chip");
		console.log("Found filter buttons:", $filterButtons.length);
		
		// Direct binding
		$filterButtons.off("click.filterEvents").on("click.filterEvents", function(e){
			e.stopPropagation();
			const $button = $(this);
			const filterValue = $button.text().trim().toLowerCase();
			
			console.log("Filter button clicked:", filterValue);
			console.log("Button element:", $button[0]);
			
			// Remove active class from all buttons
			$(".events-filter-chip").removeClass("is-active");
			
			// Add active class to clicked button
			$button.addClass("is-active");
			
			// Get all event cards in the main events grid (not recaps)
			const $eventCards = $(".events-grid .event-card");
			console.log("Found event cards:", $eventCards.length);
			
			if ($eventCards.length === 0) {
				console.error("No event cards found! Check selector: .events-grid .event-card");
				return;
			}
			
			// Remove filtered-out class from all cards first and show them
			$eventCards.removeClass("filtered-out").show();
			
			// Filter based on button text
			// Esports cards have background color #1D252C (dark gray)
			// Community cards have background color #ED1F33 (red)
			if (filterValue === "all") {
				// Show all cards
				console.log("Showing all cards");
			} else if (filterValue === "esports") {
				// Show only esports cards (background: #1D252C)
				// Hide community cards
				let hiddenCount = 0;
				let shownCount = 0;
				$eventCards.each(function(){
					const $card = $(this);
					const category = $card.attr("data-event-category");
					console.log("Card category:", category);
					if (category !== "esports") {
						$card.addClass("filtered-out");
						$card.hide(); // Direct hide as backup
						hiddenCount++;
					} else {
						$card.removeClass("filtered-out");
						$card.show(); // Ensure visible
						shownCount++;
					}
				});
				console.log("Filtered to esports. Shown:", shownCount, "Hidden:", hiddenCount);
			} else if (filterValue === "community events") {
				// Show only community cards (background: #ED1F33)
				// Hide esports cards
				let hiddenCount = 0;
				let shownCount = 0;
				$eventCards.each(function(){
					const $card = $(this);
					const category = $card.attr("data-event-category");
					console.log("Card category:", category);
					if (category !== "community") {
						$card.addClass("filtered-out");
						$card.hide(); // Direct hide as backup
						hiddenCount++;
					} else {
						$card.removeClass("filtered-out");
						$card.show(); // Ensure visible
						shownCount++;
					}
				});
				console.log("Filtered to community. Shown:", shownCount, "Hidden:", hiddenCount);
			} else {
				console.warn("Unknown filter value:", filterValue);
			}
		});
		
		// Also use event delegation as backup
		$(document).off("click.filterEventsDelegated").on("click.filterEventsDelegated", ".events-filter-chip", function(e){
			// This will be handled by the direct binding above
		});
	}, 100);
});

// Index.html Event Filter Functionality
$(document).ready(function(){
	console.log("Index event filter script loaded");
	
	// Wait a bit to ensure DOM is fully ready
	setTimeout(function() {
		// Try both direct binding and event delegation
		const $filterButtons = $(".index-filter-chip");
		console.log("Found index filter buttons:", $filterButtons.length);
		
		// Direct binding
		$filterButtons.off("click.indexFilterEvents").on("click.indexFilterEvents", function(e){
			e.stopPropagation();
			const $button = $(this);
			const filterValue = $button.text().trim().toLowerCase();
			
			console.log("Index filter button clicked:", filterValue);
			
			// Remove active class from all buttons and reset colors
			$(".index-filter-chip").removeClass("is-active");
			$(".index-filter-chip").removeClass("font-medium");
			$(".index-filter-chip").addClass("font-normal");
			$(".index-filter-chip").css("color", "#f2f2f2");
			
			// Add active class to clicked button and set active color
			$button.addClass("is-active");
			$button.removeClass("font-normal");
			$button.addClass("font-medium");
			$button.css("color", "#ed1f33");
			
			// Get all event cards in the index events grid
			const $eventCards = $(".index-events-grid .event-card");
			console.log("Found index event cards:", $eventCards.length);
			
			if ($eventCards.length === 0) {
				console.error("No event cards found! Check selector: .index-events-grid .event-card");
				return;
			}
			
			// Remove filtered-out class from all cards first and show them
			$eventCards.removeClass("filtered-out").show();
			
			// Filter based on button text
			// Esports cards have background color #1D252C (dark gray)
			// Community cards have background color #ED1F33 (red)
			if (filterValue === "all") {
				// Show all cards (3 cards - 1 row)
				console.log("Showing all cards");
			} else if (filterValue === "esports") {
				// Show only esports cards (background: #1D252C)
				// Hide community cards
				let hiddenCount = 0;
				let shownCount = 0;
				$eventCards.each(function(){
					const $card = $(this);
					const category = $card.attr("data-event-category");
					console.log("Index card category:", category);
					if (category !== "esports") {
						$card.addClass("filtered-out");
						$card.hide(); // Direct hide as backup
						hiddenCount++;
					} else {
						$card.removeClass("filtered-out");
						$card.show(); // Ensure visible
						shownCount++;
					}
				});
				console.log("Index filtered to esports. Shown:", shownCount, "Hidden:", hiddenCount);
			} else if (filterValue === "community events") {
				// Show only community cards (background: #ED1F33)
				// Hide esports cards
				let hiddenCount = 0;
				let shownCount = 0;
				$eventCards.each(function(){
					const $card = $(this);
					const category = $card.attr("data-event-category");
					console.log("Index card category:", category);
					if (category !== "community") {
						$card.addClass("filtered-out");
						$card.hide(); // Direct hide as backup
						hiddenCount++;
					} else {
						$card.removeClass("filtered-out");
						$card.show(); // Ensure visible
						shownCount++;
					}
				});
				console.log("Index filtered to community. Shown:", shownCount, "Hidden:", hiddenCount);
			} else {
				console.warn("Unknown index filter value:", filterValue);
			}
		});
	}, 100);
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
		$("#event-overlay-date-tablet").text(date);
		$("#event-overlay-time-tablet").text(time);
		
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

// Mobile Menu Toggle Functionality
$(document).ready(function(){
	const $hamburgerBtn = $('.hamburger-menu-btn');
	const $mobileMenuOverlay = $('#mobileMenuOverlay');
	const $mobileMenuPanel = $('#mobileMenuPanel');
	const $mobileLoungeMenu = $('#mobileLoungeMenu');
	const $mobileLoungeSubmenu = $('#mobileLoungeSubmenu');
	
	// Check if elements exist
	if ($hamburgerBtn.length === 0 || $mobileMenuOverlay.length === 0 || $mobileMenuPanel.length === 0) {
		console.warn('Mobile menu elements not found');
		return;
	}
	
	// Toggle mobile menu
	function toggleMobileMenu() {
		$mobileMenuOverlay.toggleClass('active');
		$mobileMenuPanel.toggleClass('active');
		// Prevent body scroll when menu is open
		if ($mobileMenuPanel.hasClass('active')) {
			$('body').css('overflow', 'hidden');
		} else {
			$('body').css('overflow', '');
		}
	}
	
	// Close mobile menu
	function closeMobileMenu() {
		$mobileMenuOverlay.removeClass('active');
		$mobileMenuPanel.removeClass('active');
		$('body').css('overflow', '');
		// Close any open submenus
		if ($mobileLoungeMenu.length > 0) {
			$mobileLoungeMenu.removeClass('expanded');
		}
		if ($mobileLoungeSubmenu.length > 0) {
			$mobileLoungeSubmenu.removeClass('active');
		}
	}
	
	// Open/close menu on hamburger button click
	$hamburgerBtn.on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		toggleMobileMenu();
		return false;
	});
	
	// Close menu when clicking overlay
	$mobileMenuOverlay.on('click', function(e) {
		e.stopPropagation();
		closeMobileMenu();
	});
	
	// Toggle LOUNGE submenu (only the toggle button, not the link)
	if ($mobileLoungeMenu.length > 0) {
		$mobileLoungeMenu.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			$(this).toggleClass('expanded');
			if ($mobileLoungeSubmenu.length > 0) {
				$mobileLoungeSubmenu.toggleClass('active');
			}
		});
	}
	
	// Allow LOUNGE link to navigate normally (don't prevent default)
	$('.mobile-menu-item-with-submenu .mobile-menu-item').on('click', function(e) {
		// Allow normal navigation - don't prevent default
		// Close the mobile menu after navigation
		setTimeout(function() {
			closeMobileMenu();
		}, 100);
	});
	
	// Close menu when clicking a menu item (navigation)
	$('.mobile-menu-item[href]').on('click', function() {
		closeMobileMenu();
	});
	
	// Close menu when clicking a submenu item
	$('.mobile-submenu-item').on('click', function() {
		closeMobileMenu();
	});
	
	// Close menu on escape key
	$(document).on('keydown', function(e) {
		if (e.key === 'Escape' && $mobileMenuPanel.hasClass('active')) {
			closeMobileMenu();
		}
	});
	
	// Prevent menu panel clicks from closing the menu
	$mobileMenuPanel.on('click', function(e) {
		e.stopPropagation();
	});
	
	// Prevent clicks on hamburger button from bubbling to document
	$(document).on('click', function(e) {
		// Don't close mobile menu if clicking hamburger button
		if ($(e.target).closest('.hamburger-menu-btn').length > 0) {
			return;
		}
		// Don't close mobile menu if clicking inside mobile menu panel
		if ($(e.target).closest('.mobile-menu-panel').length > 0) {
			return;
		}
	});
});