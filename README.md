Bento
=====

Bento is a library to pack and reorder content between multiple liquid columns. 

Demo
----
http://refinery29.github.com/bento/Demo/index.html?delay=50

Reasoning
---------

There're number of libraries that do it. Bento is different, because it will support liquid columns, unequal column widths and resolving content dimensions on a clientside.

It is also meant to be decoupled from presentation and may be used with node.js

How to run specs
----------------

You'll need to update submodules to fetch jasmine

    git submodule update --init 
    
And then

    open Specs/index.html
    
    
Upcoming features
-----------------

1) Whitespace gutter
2) Image chrome - header, date, tag
3) Request image of the right size

4) Filling holes with multiple images
5) Reflow content on window resize

6) Better scrolling handling
7) Endless grid that reuses elements

8) Inline galleries