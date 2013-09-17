Huge Slides beta 1
==========

With HugeSlides, quickly and easily view big pics and more.


## API documentation
### Example
``` js
$('.myHugeSlides').HugeSlides({/*Settings*/}); // link to start
var myHugeSlidesAPI = $('.myHugeSlides').data('HugeSlides'); // or link to the API
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
