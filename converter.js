module.exports.toNQuads = function(result) {
    let nquads = '';
    result.results.bindings.forEach((triple) => {
        let subject = triple.subject.type === 'bnode' ? '_:' + triple.subject.value : '<'+triple.subject.value+'>';
        let object = convertObject(triple.object);
        nquads += subject+ ' <'+triple.predicate.value+'> '+ object + ' .\n';
    });
    return nquads;
};

/** Converts the object entity to a valid NQuads term
 * @param {string} object - the object to be converted
 * @return {string} an NQuad term.
*/
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

