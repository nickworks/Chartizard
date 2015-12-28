var chart;

requirejs([
    'src/V2',
    'src/Chartizard',
    'src/Node',
    'src/Shape',
    'src/Rect',
    'src/CaptionCollection',
    'src/Caption'
], function(){
    chart = Chartizard("container");
});


// a nested structure won't work due to
// circular references...
// instead the nodes will have to have
// a system of IDs for lookup.
// the IDs would be used during
// import / export only
var data = {
    nodes:[{},{},{
        nodes:[{},{}]
    }]
};