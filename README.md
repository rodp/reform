Reform - HTML forms the way you want them
=========================================

Have you spent the last 15 years wishing browsers wouldn't force their style on your HTML elements? How many times did you want to style a check box or a select box as if they were divs? I thought so.

Instructions
------------

 1. Download `reform.js` (or `reform.min.js`) and include it in your HTML file.
 2. Optionally, download and include `reform.css` for default style (recommended).
 3. Whenever you want custom form elements, do this:
   - Add `reform-checkbox` class to `input[type=checkbox]` elements
   - Add `reform-selectbox` class to `select` elements
 4. Define your own CSS for "reformed" form elements or override the defaults in `reform.css`

How it works
------------

Reform will hide original elements and wrap them in "fake" elements, which are just plain divs. It will copy all your classes from the original to the fake element and replicate the behavior of the original element by setting special classes on the fake element (e.g. `checked`, `selected`, `disabled`). The state is automatically synchronized between the fake and the original, so you can trigger events and set values on the original elements without worrying about the fake element.

Check box
---------

Original:

    <input type="checkbox" class="reform-checkbox my-class">

will become:

    <div class="reform-checkbox-fake my-class">
      <input type="checkbox" style="display: none">
    </div>

For disabled original elements, fake elements will get the `disabled` class. For checked original elements, they will get the `checked` class.

Select box
----------

Original:

    <select class="reform-selectbox my-class" title="Pick a number" options-class="my-options">
      <option value="1">One</option>
      <option value="2">Two</option>
    </select>
  
will become:

    <div class="reform-selectbox-fake my-class">
      <select style="display: none" title="Pick a number" options-class="my-options">
        <option value="1">One</option>
        <option value="2">Two</option>
      </select>
      Pick a number
    </div>

Again, for disabled original elements, fake elements will get the `disabled` class.

Another div -- options container -- is attached to the `body` element and initially hidden.

    <div class="reform-options my-options"></div>
  
Once the fake element is clicked, the options container is populated and shown:

    <div class="reform-options my-options">
      <div class="reform-list">
        <div class="reform-item" value="1">One</div>
        <div class="reform-item" value="2">Two</div>
      </div>
    </div>

The options container div is automatically positioned. When an item is selected, it gets the `selected` class. You may have also noticed that, if you specify the attribute `options-class` on the original element, the value of that attribute will be set as a class on the options container div.

Dependancies
------------

  - jQuery 1.7+
