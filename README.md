Huge Slides 1.01 beta
==========

With HugeSlides, quickly and easily view big pics and more.

* IE9+
* Mobile browsers support
* Touch events
* Double tap for zoom
* CSS3 Transitions
* Responsive slider

## API documentation
### Example
Start element and link to the API

with jQuery
``` js
var myHugeSlidesAPI = $('.myHugeSlides').HugeSlides({/*Settings*/}).data('HugeSlides') 
```

### Settings

#### comicsPreviewLinks: *{Type: Array }*
Images list.
``` js
comicsPreviewLinks: ["big-pictures/10.jpg", "big-pictures/11.jpg", "big-pictures/12.jpg", "big-pictures/13.jpg"]
```

#### callback : *{Type: Function }*
Function - runs at slide change.

``` js
callback: function(index, element) {console.log( 'current item', index)}
```
