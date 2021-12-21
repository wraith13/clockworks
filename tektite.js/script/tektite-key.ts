export module Key
{
    let isInComposeSession: boolean = false;
    let lastestCompositionEndAt = 0;
    export const onCompositionStart = (_event: CompositionEvent) =>
    {
        isInComposeSession = true;
    };
    export const onCompositionEnd = (_event: CompositionEvent) =>
    {
        isInComposeSession = false;
        lastestCompositionEndAt = new Date().getTime();
    };
    export const isComposing = (event: KeyboardEvent) =>
    {
        return event.isComposing || isInComposeSession || new Date().getTime() < lastestCompositionEndAt +100;
    };
}
