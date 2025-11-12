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