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

Features
--------
1) Liquid columns, supports different column sizes
2) Hide/show columns on resize with media queries, reflows content    
3) Fixed whitespace gutter
4) Request images of the right size

Upcoming features
-----------------

1) Image chrome - header, date, tag
2) Filling holes with multiple images
3) Better scrolling handling
4) Endless grid that reuses elements
5) Inline galleries

