import { minamo } from "../../script/minamo.js";
export module Header
{
    export interface SegmentSource<PageParams, IconKeyType>
    {
        icon: IconKeyType;
        title: string;
        href?: PageParams;
        menu?: minamo.dom.Source | (() => Promise<minamo.dom.Source>);
    }
    export interface Source<PageParams, IconKeyType>
    {
        items: SegmentSource<PageParams, IconKeyType>[];
        menu?: minamo.dom.Source | (() => Promise<minamo.dom.Source>);
        operator?: minamo.dom.Source;
        parent?: PageParams;
    }
}
