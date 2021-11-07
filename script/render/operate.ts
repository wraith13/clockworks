import { minamo } from "../minamo.js";
import { Tektite } from "../../tektite/script";
import { Operate as RainbowClockOperate } from "../application/rainbowclock/operate";
import { Operate as CountdownTimerOperate } from "../application/countdowntimer/operate";
import { Operate as ElapsedTimerOperate } from "../application/elapsedtimer/operate";
import { Operate as NeverStopwatchOperate } from "../application/neverstopwatch/operate";
export module Operate
{
    export const copyToClipboard = (text: string, displayText = `"${text}"`) =>
    {
        const pre = minamo.dom.make(HTMLPreElement)
        ({
            children: text,
        });
        document.body.appendChild(pre);
        document.getSelection().selectAllChildren(pre);
        document.execCommand("copy");
        document.body.removeChild(pre);
        Tektite.Toast.make({ content: `Copied ${displayText} to the clipboard.`,});
    };
    export const RainbowClock = RainbowClockOperate;
    export const CountdownTimer = CountdownTimerOperate;
    export const ElapsedTimer = ElapsedTimerOperate;
    export const NeverStopwatch = NeverStopwatchOperate;
}
