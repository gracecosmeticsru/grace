type Category = {path:string; name:string; parent:string|null};

export function mobileCatalogLevel<T extends Category>(nodes:readonly T[], path:string|null){
 const current=nodes.find(node=>node.path===path);
 return {current, children:nodes.filter(node=>node.parent===(current?.path??null))};
}
