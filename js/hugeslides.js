function HugeSlides(link, options) {
    "use strict";

    options = options || {};
    if (!options.comicsPreviewLinks) return;
    options.continuous = options.continuous !== undefined ? options.continuous : true;

    // utilities
    var noop = function () {
        }, // simple no operation function

        offloadFn = function (fn) {
            setTimeout(fn || noop, 0)
        }, // offload a functions execution

        browser = {
            addEventListener: !!window.addEventListener,
            touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
            transitions: (function (temp) {
                var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
                for (var i in props) if (temp.style[ props[i] ] !== undefined) return true;
                return false;
            })(document.createElement('swipe'))
        }, // check browser capabilities

        slides,
        slidePos,
        width,
        length,
        index = parseInt(options.startSlide, 10) || 0,
        speed = options.speed || 300,

    // filter  img  URls
        newComicsLinks = [],
        allImagesComics = [],
        allDOMImgComics = [],
        imgCorrectUrl = /\.(jpg|png|gif|bmp)$/i,
        imageCounter = 0,

    // create inteface
        blackoutComics = $('<div class="blackoutComics"></div>'),
        bodyComics = $('<div class="bodyComics"></div>'),
        imagesComics = $('<div class="imagesComics"></div>'),
        prevComics = $('<div class="prevComics"><div class="prevComics_in"></div></div>'),
        nextComics = $('<div class="nextComics"><div class="nextComics_in"></div></div>'),
        exitComics = $('<div class="exitComics"></div>'),
        controlsComics = $('<div class="controlsComics"><a class="controlsComicsPrev" href="#prev"></a><a class="controlsComicsNext" href="#next"></a> <span class="pagesComics"><span class="current">1</span>/<span class="total">4</span></span></div>'),
        currentSlideIndicator = controlsComics.find('.current'),
        totalPagesInfoComics = controlsComics.find('.total'),
        controlsComicsPrev = controlsComics.find('.controlsComicsPrev'),
        controlsComicsNext = controlsComics.find('.controlsComicsNext'),
        element = imagesComics[0],
        container = bodyComics[0],
        content = document.createDocumentFragment(),
        cSize,
        win = $(window),
        scroll,
        scroll2,
        zoom = false;


    bodyComics
        .append(imagesComics)
        .append(controlsComics)
        .append(exitComics)
        .append(prevComics)
        .append(nextComics);


    if (!browser.touch) {
        var zoomComics = $('<div class="zoomComics" data-zoom="in"><div class="zoomComics_in"></div></div>');
        bodyComics.append(zoomComics);
        zoomComics.click(function () {
            var t = $(this);
            if (zoom) {
                zoom = false;
                setOrRemoveDragHandlers(-1);
                t.removeClass('zoomOut');
            } else {
                zoom = true;
                setOrRemoveDragHandlers(index);
                t.addClass('zoomOut');
            }
        });
    }  // adaptive zoom button

    $(document.body).append(blackoutComics).append(bodyComics);


    for (var i = 0, comicsLinksLength = options.comicsPreviewLinks.length; i < comicsLinksLength; i++) {
        if (imgCorrectUrl.test(options.comicsPreviewLinks[i])) {
            newComicsLinks.push(options.comicsPreviewLinks[i])
        }
    }

    var newComicsLinksLength = newComicsLinks.length;
    totalPagesInfoComics.text(newComicsLinksLength);

    // создаем слайды с картинками
    for (var i = 0, canvas, div; i < newComicsLinksLength; i++) {
        cSize = getNewSize(500, 500);
        canvas = document.createElement("canvas");
        canvas.width = cSize.w;
        canvas.height = cSize.h;
        canvas.top = "130px";
        canvas.addEventListener('touchend', doubleTap, false);
        div = document.createElement("div");
        div.className = "imagesComicsItem loadImg";
        div.appendChild(canvas);
        content.appendChild(div);

        allImagesComics.push(canvas);
    }

    //добавляем слайды в основной контейнер
    element.appendChild(content);


    function doubleTap(e) {
        var delay = 300;
        var now = new Date().getTime();

        // the first time this will make delta a negative number
        var lastTouch = $(this).data('lastTouch') || now + 1;
        var delta = now - lastTouch;
        if (delta < delay && 0 < delta) {
            // After we detct a doubletap, start over
            $(this).data('lastTouch', null);

            if (zoom) {
                zoom = false;
                setOrRemoveDragHandlers(-1);
            } else {
                zoom = true;
                setOrRemoveDragHandlers(index);
            }

        } else {
            $(this).data('lastTouch', now);
        }
    }

    var position = 500, position2 = 500;

    // перетаскивание картинки
    function startDrag(e) {
        var testEl = allImagesComics[index],

            pos = [testEl.offsetLeft, testEl.offsetTop],
            origin = getCoors(e).left,
            origin2 = getCoors(e).top,
            originTime = new Date().getTime(),
            step = 40,	// in milliseconds
            elWidth = testEl.width,
            elHeight = testEl.height,
            startPos,
            speed,
            distance = 0,
           // min = -elWidth / 2,
            min = -position + $(window).width() / 2,
            //max = $(window).width() - elWidth / 2,
            max = $(window).width() / 2,

            startPos2,
            speed2,
            distance2 = 0,
           // min2 = -elHeight / 2,
           // max2 = $(window).height() / 2;
            min2 = -position2 + $(window).height() / 2,
            max2 = $(window).height() / 2;

        clearInterval(scroll);
        clearInterval(scroll2);

        if (browser.touch) {
            testEl.addEventListener('touchmove', moveDrag, false);
            testEl.addEventListener('touchend', endDrag, false);
        } else {
            testEl.onmousemove = moveDrag;
            document.onmouseup = endDrag;
        }

        function endDrag(e) {
            var end = getCoors(e).left,
                end2 = getCoors(e).top,
                endTime = new Date().getTime(),
                dist = end - origin,
                dist2 = end2 - origin2,
                time = endTime - originTime;

            startPos = testEl.offsetLeft;
            startPos2 = testEl.offsetTop;

            speed = dist / (time / 1000); // pixels per second
            speed2 = dist2 / (time / 1000); // pixels per second

            //'Speed is ' + Math.abs(Math.round(speed)) + ' pixels per second!';
            scroll = setInterval(extraScroll, step);
            scroll2 = setInterval(extraScroll2, step);

            if (browser.touch) {
                testEl.removeEventListener('touchend', endDrag, false);
                testEl.removeEventListener('touchmove', moveDrag, false);
            } else {
                testEl.onmousemove = document.onmouseup = null;
            }
        }

        return false; // cancels scrolling

        function extraScroll() {
            distance += Math.round(speed * (step / 1000));
            var newPos = startPos + distance;
            if (newPos > max || newPos < min) {
                clearInterval(scroll);
                return;
            }
            testEl.style.left = newPos + 'px';
            speed *= .85;
            if (Math.abs(speed) < 10) {
                speed = 0;
                clearInterval(scroll);
            }
        }

        function extraScroll2() {
            distance2 += Math.round(speed2 * (step / 1000));
            var newPos2 = startPos2 + distance2;
            if (newPos2 > max2 || newPos2 < min2) {
                clearInterval(scroll2);
                return;
            }
            testEl.style.top = newPos2 + 'px';
            speed2 *= .85;
            if (Math.abs(speed2) < 10) {
                speed2 = 0;
                clearInterval(scroll2);
            }
        }

        function moveDrag(e) {
            var currentPos = getCoors(e).left,
                currentPos2 = getCoors(e).top,
                newPos = (currentPos - origin) + pos[0],
                newPos2 = (currentPos2 - origin2) + pos[1];

            if (newPos <= max && newPos >= min) {
                testEl.style.left = newPos + 'px';
            }
            if (newPos2 <= max2 && newPos2 >= min2) {
                testEl.style.top = newPos2 + 'px';
            }
        }

        function getCoors(e) {
            var left, top;
            if (e.changedTouches) {// iPhone
                left = e.changedTouches[0].clientX;
                top = e.changedTouches[0].clientY;
            } else {
                // all others
                left = e.clientX;
                top = e.clientY;
            }
            return {left: left, top: top};
        }
    }

    // запуск/остановка перетаскивания картинки
    function setOrRemoveDragHandlers(currentIndex) {
        if (zoom) {
            removeTouchListeners();
        } else {
            addTouchListeners();
        }

        clearInterval(scroll);
        clearInterval(scroll2);

        var el, i = newComicsLinksLength;
        while (i--) {
            el = allImagesComics[i];
            if (zoom) {
                zoomIn(el, i);
            } else {
                zoomOut(el, i);
            }
            if (zoom && currentIndex >= 0 && i === currentIndex) {
                if (browser.touch) {
                    el.addEventListener('touchstart', startDrag, false);
                } else {

                    el.onmousedown = startDrag;
                }
            } else {
                if (browser.touch) {
                    el.removeEventListener('touchstart', startDrag, false);
                } else {
                    el.onmousedown = null;
                }
            }
        }
    }

    function zoomIn(curImg, i) {
        var curImgW, curImgH;
        curImg.width = curImgW = curImg.getAttribute('data-widthImg') || 300;
        curImg.height = curImgH = curImg.getAttribute('data-heightImg') || 500;
        curImg.setAttribute('data-zoomed', '1');

        position = curImgW;
        position2 = curImgH;

        if (browser.touch) {
            curImg.style.backgroundImage = 'url(' + newComicsLinks[i] + ')';
            curImg.style.position = 'absolute';
        } else {
            curImg.getContext("2d").clearRect(0, 0, curImgW, curImgH);
            if (allDOMImgComics[i]) {
                curImg.getContext("2d").drawImage(allDOMImgComics[i], 0, 0, curImgW, curImgH);
            }
        }
        curImg.style.top = '0';
        curImg.style.left = ($(window).width() - curImgW) / 2 + 'px';
    }

    function zoomOut(curImg, i) {
        var curImgW, curImgH, smallSize;
        curImgW = curImg.getAttribute('data-widthImg') || 300;
        curImgH = curImg.getAttribute('data-heightImg') || 500;
        curImg.setAttribute('data-zoomed', '0');


        if (browser.touch) {
            resizeCanvas(curImg);
            curImg.style.backgroundImage = 'url(' + newComicsLinks[i] + ')';
            curImg.style.position = 'relative';
            curImg.style.left = 0;
            curImg.style.top = 0;
        } else {
            smallSize = getNewSize(curImgW, curImgH);
            curImg.width = smallSize.w;
            curImg.height = smallSize.h;
            centering(curImg, smallSize);
            curImg.getContext("2d").clearRect(0, 0, smallSize.w, smallSize.h);
            if (allDOMImgComics[i]) {
                curImg.getContext("2d").drawImage(allDOMImgComics[i], 0, 0, smallSize.w, smallSize.h);
            }
        }
    }

    function resizeCanvas(c) {
        var w = $(window),
            wW = w.width(),
            wH = w.height();
        c.width = wW;
        c.height = wH;
    }

    function responsive() {
        var el, i = newComicsLinksLength;
        while (i--) {
            el = allImagesComics[i];
            if (browser.touch) {
                el.style.position = 'relative';
                el.style.left = 0;
                el.style.top = 0;
                resizeCanvas(el);
                console.log(el);
            }
        }
    }

    function getNewSize(w, h) {
        var x = (win.height() - 130 - 20) / h,
            wx = w * x,
            hx = h * x; // высота холста просмотра превьюшек
        return {w: wx, h: hx};
    }

    function centering(canvasEl, size) {
        if (browser.touch) return;
        canvasEl.style.position = 'absolute';
        canvasEl.style.left = win.width() / 2 - size.w / 2 + 'px';
        canvasEl.style.top = 130 + 'px';
    }

    // preload img
    function preload(url, index) {
        if (index + 1 > newComicsLinksLength) {
            return false;
        }

        var canvasEl = allImagesComics[index],
            c = canvasEl.getContext("2d");
        var $img = $("<img />"),
            img = $img[0];

        img.src = newComicsLinks[index];

        $img.one('load',function () {
            if (index + 1 > newComicsLinksLength) {
                return false;
            }
            imageCounter++;
            var t = this,
                w = t.width,
                h = t.height,
                size = getNewSize(w, h);

            canvasEl.parentNode.className = 'imagesComicsItem';
            canvasEl.setAttribute('data-widthImg', w);
            canvasEl.setAttribute('data-heightImg', h);

            if (zoom) {
                centering(canvasEl, {w: w, h: h});
            } else {
                centering(canvasEl, size);
            }

            if (canvasEl.getAttribute('data-zoomed') === '1') {
                canvasEl.width = w;
                canvasEl.height = h;
                c.drawImage(t, 0, 0, w, h);

            } else {
                if (browser.touch) {
                    canvasEl.style.backgroundImage = 'url(' + newComicsLinks[index] + ')';
                } else {
                    canvasEl.width = size.w;
                    canvasEl.height = size.h;
                    c.drawImage(t, 0, 0, size.w, size.h);
                }
            }

            allDOMImgComics[index] = t;

        }).each(function () {
                if (this.complete) $(this).load();
            });

        img.src = newComicsLinks[index];

    }

    function preloadNext(curIndex) {
        var nextIndex = curIndex + 1;
        if (nextIndex >= length) {
            return false;
        }
        preload(newComicsLinks[nextIndex], nextIndex);
    }

    function setup() {

        // cache slides
        slides = element.children;
        length = slides.length;

        // set continuous to false if only one slide
        if (length < 2) options.continuous = false;

        // предзагрузка стартовых картинок
        if (length !== 0) {
            preload(newComicsLinks[0], 0);
            if (length > 1) {
                preload(newComicsLinks[1], 1);
            }
        }

        //special case if two slides
        if (browser.transitions && options.continuous && slides.length < 3) {
            element.appendChild(slides[0].cloneNode(true));
            element.appendChild(element.children[1].cloneNode(true));
            slides = element.children;
        }

        // create an array to store current positions of each slide
        slidePos = new Array(slides.length);

        // determine width of each slide
        width = container.getBoundingClientRect().width || container.offsetWidth;

        element.style.width = (slides.length * width) + 'px';

        // stack elements
        var pos = slides.length;
        while (pos--) {

            var slide = slides[pos];

            slide.style.width = width + 'px';
            slide.setAttribute('data-index', pos);

            if (browser.transitions) {
                slide.style.left = (pos * -width) + 'px';
                move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
            }
        }

        // reposition elements before and after index
        if (options.continuous && browser.transitions) {
            move(circle(index - 1), -width, 0);
            move(circle(index + 1), width, 0);
        }

        if (!browser.transitions) element.style.left = (index * -width) + 'px';
        container.style.visibility = 'visible';
    }

    function prev() {
        if (options.continuous) slide(index - 1);
        else if (index) slide(index - 1);
    }

    function next() {
        if (options.continuous) slide(index + 1);
        else if (index < slides.length - 1) slide(index + 1);
    }

    function circle(index) {
        // a simple positive modulo using slides.length
        return (slides.length + (index % slides.length)) % slides.length;
    }

    function slide(to, slideSpeed) {
        // do nothing if already on requested slide
        if (index == to) return;

        if (browser.transitions) {
            var direction = Math.abs(index - to) / (index - to); // 1: backward, -1: forward

            // get the actual position of the slide
            if (options.continuous) {
                var natural_direction = direction;
                direction = -slidePos[circle(to)] / width;

                // if going forward but to < index, use to = slides.length + to
                // if going backward but to > index, use to = -slides.length + to
                if (direction !== natural_direction) to = -direction * slides.length + to;
            }

            var diff = Math.abs(index - to) - 1;

            // move all the slides between index and to in the right direction
            while (diff--) move(circle((to > index ? to : index) - diff - 1), width * direction, 0);

            to = circle(to);

            move(index, width * direction, slideSpeed || speed);
            move(to, 0, slideSpeed || speed);

            if (options.continuous) move(circle(to - direction), -(width * direction), 0); // we need to get the next in place
        } else {
            to = circle(to);
            animate(index * -width, to * -width, slideSpeed || speed);
            //no fallback for a circular continuous if the browser does not accept transitions
        }

        index = to;
        setOrRemoveDragHandlers(index);
        preloadNext(index);
        currentSlideIndicator.text(index + 1);
        offloadFn(options.callback && options.callback(index, slides[index]));
    }

    function move(index, dist, speed) {
        translate(index, dist, speed);
        slidePos[index] = dist;
    }

    function translate(index, dist, speed) {
        var slide = slides[index];
        var style = slide && slide.style;

        if (!style) return;

        style.webkitTransitionDuration =
            style.MozTransitionDuration =
                style.msTransitionDuration =
                    style.OTransitionDuration =
                        style.transitionDuration = speed + 'ms';

        style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
        style.msTransform =
            style.MozTransform =
                style.OTransform = 'translateX(' + dist + 'px)';
    }

    function animate(from, to, speed) {

        // if not an animation, just reposition
        if (!speed) {
            element.style.left = to + 'px';
            return;
        }

        var start = +new Date;

        var timer = setInterval(function () {
            var timeElap = +new Date - start;
            if (timeElap > speed) {
                element.style.left = to + 'px';
                if (delay) begin();
                options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);
                clearInterval(timer);
                return;
            }
            element.style.left = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';
        }, 4);
    }

    // setup auto slideshow
    var delay = options.auto || 0;
    var interval;

    function begin() {
        interval = setTimeout(next, delay);
    }

    function stop() {
        delay = 0;
        clearTimeout(interval);
    }

    // setup initial vars
    var start = {};
    var delta = {};
    var isScrolling;

    // setup event capturing
    var events = {
        handleEvent: function (event) {
            switch (event.type) {
                case 'touchstart':
                    this.start(event);
                    break;
                case 'touchmove':
                    this.move(event);
                    break;
                case 'touchend':
                    offloadFn(this.end(event));
                    break;
                case 'webkitTransitionEnd':
                case 'msTransitionEnd':
                case 'oTransitionEnd':
                case 'otransitionend':
                case 'transitionend':
                    offloadFn(this.transitionEnd(event));
                    break;
                case 'resize':
                    offloadFn(setup.call());
                    break;
            }
            if (options.stopPropagation) event.stopPropagation();
        },
        start: function (event) {

            var touches = event.touches[0];

            // measure start values
            start = {
                // get initial touch coords
                x: touches.pageX,
                y: touches.pageY,
                // store time to determine touch duration
                time: +new Date
            };

            // used for testing first move event
            isScrolling = undefined;

            // reset delta and end measurements
            delta = {};

            // attach touchmove and touchend listeners
            element.addEventListener('touchmove', this, false);
            element.addEventListener('touchend', this, false);
        },
        move: function (event) {

            // ensure swiping with one touch and not pinching
            if (event.touches.length > 1 || event.scale && event.scale !== 1) return;

            if (options.disableScroll) event.preventDefault();

            var touches = event.touches[0];

            // measure change in x and y
            delta = {
                x: touches.pageX - start.x,
                y: touches.pageY - start.y
            };

            // determine if scrolling test has run - one time test
            if (typeof isScrolling == 'undefined') {
                isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
            }

            // if user is not trying to scroll vertically
            if (!isScrolling) {

                // prevent native scrolling
                event.preventDefault();

                // stop slideshow
                stop();

                // increase resistance if first or last slide
                if (options.continuous) { // we don't add resistance at the end
                    translate(circle(index - 1), delta.x + slidePos[circle(index - 1)], 0);
                    translate(index, delta.x + slidePos[index], 0);
                    translate(circle(index + 1), delta.x + slidePos[circle(index + 1)], 0);
                } else {
                    delta.x =
                        delta.x /
                            ( (!index && delta.x > 0               // if first slide and sliding left
                                || index == slides.length - 1        // or if last slide and sliding right
                                && delta.x < 0                       // and if sliding at all
                                ) ?
                                ( Math.abs(delta.x) / width + 1 )      // determine resistance level
                                : 1 );                                 // no resistance if false

                    // translate 1:1
                    translate(index - 1, delta.x + slidePos[index - 1], 0);
                    translate(index, delta.x + slidePos[index], 0);
                    translate(index + 1, delta.x + slidePos[index + 1], 0);
                }
            }
        },
        end: function (event) {

            // measure duration
            var duration = +new Date - start.time;

            // determine if slide attempt triggers next/prev slide
            var isValidSlide =
                Number(duration) < 250               // if slide duration is less than 250ms
                    && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
                    || Math.abs(delta.x) > width / 2;      // or if slide amt is greater than half the width

            // determine if slide attempt is past start and end
            var isPastBounds =
                !index && delta.x > 0                            // if first slide and slide amt is greater than 0
                    || index == slides.length - 1 && delta.x < 0;    // or if last slide and slide amt is less than 0

            if (options.continuous) isPastBounds = false;

            // determine direction of swipe (true:right, false:left)
            var direction = delta.x < 0;

            // if not scrolling vertically
            if (!isScrolling) {
                if (isValidSlide && !isPastBounds) {
                    if (direction) {
                        if (options.continuous) { // we need to get the next in this direction in place
                            move(circle(index - 1), -width, 0);
                            move(circle(index + 2), width, 0);
                        } else {
                            move(index - 1, -width, 0);
                        }
                        move(index, slidePos[index] - width, speed);
                        move(circle(index + 1), slidePos[circle(index + 1)] - width, speed);
                        index = circle(index + 1);
                    } else {
                        if (options.continuous) { // we need to get the next in this direction in place
                            move(circle(index + 1), width, 0);
                            move(circle(index - 2), -width, 0);
                        } else {
                            move(index + 1, width, 0);
                        }
                        move(index, slidePos[index] + width, speed);
                        move(circle(index - 1), slidePos[circle(index - 1)] + width, speed);
                        index = circle(index - 1);
                    }

                    preloadNext(index);
                    currentSlideIndicator.text(index + 1);
                    options.callback && options.callback(index, slides[index]);
                } else {
                    if (options.continuous) {
                        move(circle(index - 1), -width, speed);
                        move(index, 0, speed);
                        move(circle(index + 1), width, speed);
                    } else {
                        move(index - 1, -width, speed);
                        move(index, 0, speed);
                        move(index + 1, width, speed);
                    }
                }
            }

            // kill touchmove and touchend event listeners until touchstart called again
            element.removeEventListener('touchmove', events, false);
            element.removeEventListener('touchend', events, false);
        },
        transitionEnd: function (event) {
            if (parseInt(event.target.getAttribute('data-index'), 10) == index) {
                if (delay) begin();
                options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);
            }
        }
    };

    // trigger setup
    setup();

    // start auto slideshow if applicable
    if (delay) begin();

    // set touchstart event on element
    function addTouchListeners() {
        if (browser.touch) element.addEventListener('touchstart', events, false);
    }

    // add event listeners
    if (browser.addEventListener) {
        addTouchListeners();
        if (browser.transitions) {
            element.addEventListener('webkitTransitionEnd', events, false);
            element.addEventListener('msTransitionEnd', events, false);
            element.addEventListener('oTransitionEnd', events, false);
            element.addEventListener('otransitionend', events, false);
            element.addEventListener('transitionend', events, false);
        }
        window.addEventListener('resize', events, false);
    } else {
        window.onresize = function () {
            setup()
        }; // old IE
    }

    function removeTouchListeners() {
        element.removeEventListener('touchstart', events, false);
        element.removeEventListener('touchmove', events, false);
        element.removeEventListener('touchend', events, false);
    }

    function show(e) {
        e.preventDefault();

        document.body.addEventListener('touchstart', stopScrolling, false);
        document.body.addEventListener('touchmove', stopScrolling, false);
        $(document.body).addClass('scrollHide');
        blackoutComics.fadeIn(100);
        bodyComics.fadeIn(800, function () {
            setup();
            responsive();
        });
        return false;
    }

    function close(e) {
        e.stopPropagation();
        document.body.removeEventListener('touchstart', stopScrolling, false);
        document.body.removeEventListener('touchmove', stopScrolling, false);
        bodyComics.hide();
        blackoutComics.fadeOut(800);
        $(document.body).removeClass('scrollHide');
    }

    function stopScrolling(e) {
        e.preventDefault();
    }

    // controls
    link.on('click', show);
    exitComics.on('click', close);
    nextComics.on('click', next);
    prevComics.on('click', prev);
    controlsComicsNext.on('click', next);
    controlsComicsPrev.on('click', prev);


    // API
    var API = {
        setup: function () {
            setup();
        },
        slide: function (to, speed) {
            // cancel slideshow
            stop();
            slide(to, speed);
        },
        prev: function () {
            // cancel slideshow
            stop();
            prev();
        },
        next: function () {
            // cancel slideshow
            stop();
            next();
        },
        getPos: function () {

            // return current index position
            return index;

        },
        getNumSlides: function () {

            // return total number of slides
            return length;
        },
        kill: function () {

            // cancel slideshow
            stop();

            // reset element
            element.style.width = 'auto';
            element.style.left = 0;

            // reset slides
            var pos = slides.length;
            while (pos--) {
                var slide = slides[pos];
                slide.style.width = '100%';
                slide.style.left = 0;
                if (browser.transitions) translate(pos, 0, 0);
            }

            // removed event listeners
            if (browser.addEventListener) {

                // remove current event listeners
                element.removeEventListener('touchstart', events, false);
                element.removeEventListener('webkitTransitionEnd', events, false);
                element.removeEventListener('msTransitionEnd', events, false);
                element.removeEventListener('oTransitionEnd', events, false);
                element.removeEventListener('otransitionend', events, false);
                element.removeEventListener('transitionend', events, false);
                window.removeEventListener('resize', events, false);
            }
            else {
                window.onresize = null;
            }
        }
    };

    return API;
}


if (window.jQuery || window.Zepto) {
    (function ($) {
        $.fn.HugeSlides = function (params) {
            return this.each(function () {
                $(this).data('HugeSlides', new HugeSlides($(this), params));
            });
        }
    })(window.jQuery || window.Zepto)
}
