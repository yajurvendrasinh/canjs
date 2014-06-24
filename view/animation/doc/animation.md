@function can.view.animation.can-animation can.animation
@parent can.view

# Example Usage

## Fading In
Fading in a component when it is inserted

`<app-component can-fade-in="slow"></app-component>``

## Fading In and Out
Fading a list element when it is inserted or removed

```html
<ul class="cart-list">
    {{#each cart}}
    <li class="product" can-fade-in="fast" can-fade-out="fast">{{name}}</li>
    {{/each}}
</ul>
```

## Animation on a change
Performing a "bounce" animation for a cart widget when the cart length changes

```html
<div class="cart-widget">
    {{#if cart.length}}
        <span can-animation="{cartBounce}" can-animation-when="{cart} length" class="cart-number">{{cart.length}}</span>
    {{/if}}
    <span>Cart</span>
</div>
```

```javascript
scope{
    cart: ['apples', 'oranges', 'grapefruit'],
    cartBounce: {
        //object specifying CSS bounce properties
    }
}
```

## Loading Spinner
Display a spinning icon while loading model data, then fade in when model data is loaded.

```html
<div can-fade-in="fast" can-animation-when="{products}">
    {{#if products}}
        <span class="spinner"></span>
    {{/if}}
</div>
```

```javascript
scope{
    products: new Product.List({})
}
```

## Custom Animation on Insertion
Defining a custom CSS animation to be performed when element is inserted.

`<div can-animation-inserted="{cssProperties}"></div>``

## Using Multiple Attributes

```html
<div can-animation-duration="slow" can-animation-when="{scopeProperty}" can-animation-start="startFunction" can-animation-complete="completeFunction"></div>
```

## Defaults
Defaults displayed for reference

`<div can-animation-style="display: block" can-animation-when="inserted" can-animation-duration="400" can-animation-easing="swing"></div>`

## Advanced Custom Animation
Defining a custom animation using only the can-animation attribute. Defaults are specified where applicable.

`<div can-animation="{animationProperties}"></div>`

```javascript
scope{
    animationProperties: {
        properties: {  
            //object of CSS properties and values animation will move toward
        },
        options: {
            //map of additional options
            duration: 400, //default
            easing: 'swing', //default
            queue: true, //default
            specialEasing: {}, //map of CSS properties with easing functions
            step: function(now, tween){}, //functions defined in jQuery animate
            progress: function(animation, progress, remainingMs){},
            complete: function(){},
            start: function(animation){},
            done: function(animation, jumpedToEnd){},
            fail: function(animation, jumpedToEnd){},
            always: function(animation, jumpedToEnd){}
        }
    }
}
```

