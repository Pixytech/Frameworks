
import { ViewModelBase } from "./ViewModelBase";

//todo : implement to support add range etc & auto notify changes etc - this is very basic for now
export class ObservableCollection<TItem> extends ViewModelBase<void> //implements Array<TItem>
{
    public readonly source: Array<TItem>;
    
    constructor(array:Array<TItem> ){
        super();
        this.source=array;
    }

    public get length() {
        return this.source.length;
    }

    map<U>(callbackfn: (value: TItem, index: number, array: TItem[]) => U, thisArg?: any): U[] {
        return this.source.map(callbackfn,thisArg);
    }

    pop(): TItem | undefined {
        try{
            return this.source.pop();
        }finally{
            this.notifyModelChanged();
        }
    }
    push(...items: TItem[]): number {
        try{
        return this.source.push(...items);
    }finally{
        this.notifyModelChanged();
    }
    }

    splice(start: number, deleteCount?: number | undefined): TItem[];
    splice(start: number, deleteCount: number, ...items: TItem[]): TItem[] {
    //splice(start: unknown, deleteCount?: unknown, ...rest?: unknown[]): TItem[] {
        try{
        return this.source.splice(start,deleteCount,...items);
    }finally{
        this.notifyModelChanged();
    }
    }

    item(n: number): TItem{
        return this.source[n];
    }


    /* /* public get [n: number]: TItem {
        return this.source.length;
    } 


    
    [n: number]: TItem;


    toString(): string {
        return this.source.toString();
    }
    toLocaleString(): string {
        return this.source.toLocaleString();
    }
    
    concat(...items: ConcatArray<TItem>[]): TItem[];
    concat(...items: (TItem | ConcatArray<TItem>)[]): TItem[];
    concat(...items?: unknown[]): TItem[] {
        throw new Error("Method not implemented.");
    }
    join(separator?: string | undefined): string {
        throw new Error("Method not implemented.");
    }
    reverse(): TItem[] {
        throw new Error("Method not implemented.");
    }
    shift(): TItem | undefined {
        throw new Error("Method not implemented.");
    }
    slice(start?: number | undefined, end?: number | undefined): TItem[] {
        throw new Error("Method not implemented.");
    }
    sort(compareFn?: ((a: TItem, b: TItem) => number) | undefined): this {
        throw new Error("Method not implemented.");
    }
    
    unshift(...items: TItem[]): number {
        throw new Error("Method not implemented.");
    }
    indexOf(searchElement: TItem, fromIndex?: number | undefined): number {
        throw new Error("Method not implemented.");
    }
    lastIndexOf(searchElement: TItem, fromIndex?: number | undefined): number {
        throw new Error("Method not implemented.");
    }
    every<S extends TItem>(predicate: (value: TItem, index: number, array: TItem[]) => value is S, thisArg?: any): this is S[];
    every(predicate: (value: TItem, index: number, array: TItem[]) => unknown, thisArg?: any): boolean;
    every(predicate: unknown, thisArg?: unknown): boolean {
        throw new Error("Method not implemented.");
    }
    some(predicate: (value: TItem, index: number, array: TItem[]) => unknown, thisArg?: any): boolean {
        throw new Error("Method not implemented.");
    }
    forEach(callbackfn: (value: TItem, index: number, array: TItem[]) => void, thisArg?: any): void {
        throw new Error("Method not implemented.");
    }
    map<U>(callbackfn: (value: TItem, index: number, array: TItem[]) => U, thisArg?: any): U[] {
        throw new Error("Method not implemented.");
    }
    filter<S extends TItem>(predicate: (value: TItem, index: number, array: TItem[]) => value is S, thisArg?: any): S[];
    filter(predicate: (value: TItem, index: number, array: TItem[]) => unknown, thisArg?: any): TItem[];
    filter(predicate: unknown, thisArg?: unknown): TItem[] | S[] {
        throw new Error("Method not implemented.");
    }
    reduce(callbackfn: (previousValue: TItem, currentValue: TItem, currentIndex: number, array: TItem[]) => TItem): TItem;
    reduce(callbackfn: (previousValue: TItem, currentValue: TItem, currentIndex: number, array: TItem[]) => TItem, initialValue: TItem): TItem;
    reduce<U>(callbackfn: (previousValue: U, currentValue: TItem, currentIndex: number, array: TItem[]) => U, initialValue: U): U;
    reduce(callbackfn: unknown, initialValue?: unknown): TItem | U {
        throw new Error("Method not implemented.");
    }
    reduceRight(callbackfn: (previousValue: TItem, currentValue: TItem, currentIndex: number, array: TItem[]) => TItem): TItem;
    reduceRight(callbackfn: (previousValue: TItem, currentValue: TItem, currentIndex: number, array: TItem[]) => TItem, initialValue: TItem): TItem;
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: TItem, currentIndex: number, array: TItem[]) => U, initialValue: U): U;
    reduceRight(callbackfn: unknown, initialValue?: unknown): TItem | U {
        throw new Error("Method not implemented.");
    }
    find<S extends TItem>(predicate: (this: void, value: TItem, index: number, obj: TItem[]) => value is S, thisArg?: any): S | undefined;
    find(predicate: (value: TItem, index: number, obj: TItem[]) => unknown, thisArg?: any): TItem | undefined;
    find(predicate: unknown, thisArg?: unknown): TItem | S | undefined {
        throw new Error("Method not implemented.");
    }
    findIndex(predicate: (value: TItem, index: number, obj: TItem[]) => unknown, thisArg?: any): number {
        throw new Error("Method not implemented.");
    }
    fill(value: TItem, start?: number | undefined, end?: number | undefined): this {
        throw new Error("Method not implemented.");
    }
    copyWithin(target: number, start: number, end?: number | undefined): this {
        throw new Error("Method not implemented.");
    }
    entries(): IterableIterator<[number, TItem]> {
        throw new Error("Method not implemented.");
    }
    keys(): IterableIterator<number> {
        throw new Error("Method not implemented.");
    }
    values(): IterableIterator<TItem> {
        throw new Error("Method not implemented.");
    }
    includes(searchElement: TItem, fromIndex?: number | undefined): boolean {
        throw new Error("Method not implemented.");
    }
    flatMap<U, This = undefined>(callback: (this: This, value: TItem, index: number, array: TItem[]) => U | readonly U[], thisArg?: This | undefined): U[] {
        throw new Error("Method not implemented.");
    }
    flat<A, D extends number = 1>(this: A, depth?: D | undefined): FlatArray<A, D>[] {
        throw new Error("Method not implemented.");
    }
    at(index: number): TItem | undefined {
        throw new Error("Method not implemented.");
    }
    [Symbol.iterator](): IterableIterator<TItem> {
        throw new Error("Method not implemented.");
    }
    [Symbol.unscopables](): { copyWithin: boolean; entries: boolean; fill: boolean; find: boolean; findIndex: boolean; keys: boolean; values: boolean; } {
        throw new Error("Method not implemented.");
    }

     */

    
    
    protected createModel(): void {
    }

}