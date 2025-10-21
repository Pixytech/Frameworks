import { PubSubEvent } from "@kinetix/core";
import { TicketData } from "../TicketData";

export class TicketLaunchEvent extends PubSubEvent<TicketData>
{
    public static readonly Type = Symbol.for("TicketLaunchEvent")

}

