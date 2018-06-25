module.exports.toNQuads = function(result) {
    let nquads = '';
    result.results.bindings.forEach((triple) => {
        let subject = triple.subject.type === 'bnode' ? '_:' + triple.subject.value : '<'+triple.subject.value+'>';
        let object = convertObject(triple.object);
        nquads += subject+ ' <'+triple.predicate.value+'> '+ object + ' .\n';
    });
    return nquads;
};

function convertObject(object) {
    let obj = '';
    if (object.type === 'bnode') {
        obj = '_:' + object.value;
    } else if (object.type === 'uri') {
        obj = '<' + object.value+'>';
    } else {
        obj = '"'+object.value+'"';
    }
    return obj;
}

