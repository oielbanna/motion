import { warning } from "hey-listen"
import * as React from "react"
import { useConstant } from "../../utils/use-constant"
import {
    VisualElementDragControls,
    DragControlOptions,
} from "./VisualElementDragControls"

/**
 * Can manually trigger a drag gesture on one or more `drag`-enabled `motion` components.
 *
 * @library
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * function startDrag(event) {
 *   dragControls.start(event, { snapToCursor: true })
 * }
 *
 * return (
 *   <>
 *     <Frame onTapStart={startDrag} />
 *     <Frame drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 *
 * @motion
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * function startDrag(event) {
 *   dragControls.start(event, { snapToCursor: true })
 * }
 *
 * return (
 *   <>
 *     <div onPointerDown={startDrag} />
 *     <motion.div drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 *
 * @public
 */
export class DragControls {
    private componentControls = new Set<VisualElementDragControls>()

    /**
     * Subscribe a component's internal `VisualElementDragControls` to the user-facing API.
     *
     * @internal
     */
    subscribe(controls: VisualElementDragControls): () => void {
        this.componentControls.add(controls)
        return () => this.componentControls.delete(controls)
    }

    /**
     * Start a drag gesture on every `motion` component that has this set of drag controls
     * passed into it via the `dragControls` prop.
     *
     * ```jsx
     * dragControls.start(e, {
     *   snapToCursor: true
     * })
     * ```
     *
     * @param event - PointerEvent
     * @param options - Options
     *
     * @public
     */
    start(
        event:
            | React.MouseEvent
            | React.TouchEvent
            | React.PointerEvent
            | MouseEvent
            | TouchEvent
            | PointerEvent,
        options?: DragControlOptions
    ) {
        const originalEvent = (event as React.PointerEvent).nativeEvent || event

        this.componentControls.forEach((controls) => {
            controls.start(convertExternalPointerEvent(originalEvent), options)
        })
    }
}

const createDragControls = () => new DragControls()

/**
 * Usually, dragging is initiated by pressing down on a `motion` component with a `drag` prop
 * and moving it. For some use-cases, for instance clicking at an arbitrary point on a video scrubber, we
 * might want to initiate that dragging from a different component than the draggable one.
 *
 * By creating a `dragControls` using the `useDragControls` hook, we can pass this into
 * the draggable component's `dragControls` prop. It exposes a `start` method
 * that can start dragging from pointer events on other components.
 *
 * @library
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * function startDrag(event) {
 *   dragControls.start(event, { snapToCursor: true })
 * }
 *
 * return (
 *   <>
 *     <Frame onTapStart={startDrag} />
 *     <Frame drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 *
 * @motion
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * function startDrag(event) {
 *   dragControls.start(event, { snapToCursor: true })
 * }
 *
 * return (
 *   <>
 *     <div onPointerDown={startDrag} />
 *     <motion.div drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 *
 * @public
 */
export function useDragControls() {
    return useConstant(createDragControls)
}

function convertMouseToPointer(event: MouseEvent): PointerEvent {
    return {
        ...event,
        isPrimary: true,
        pointerType: "mouse",
    } as PointerEvent
}

function convertTouchToPointer(event: TouchEvent): PointerEvent {
    const primaryTouch = event.touches[0] || event.changedTouches[0]
    return {
        pageX: primaryTouch.pageX,
        pageY: primaryTouch.pageY,
        clientX: primaryTouch.clientX,
        clientY: primaryTouch.clientY,
        isPrimary: true,
        pointerType: "touch",
    } as PointerEvent
}

/**
 * `dragControls.start` can be started by an external event. Internally, we use PointerEvents.
 * This leaves us in the siutation where a user could provide a MouseEvent or TouchEvent so
 * here we convert them to a working version of a PointerEvent
 *
 * This is deprecated - in a 3.0 we can remove these converters.
 */
function convertExternalPointerEvent(
    event: MouseEvent | TouchEvent | PointerEvent
): PointerEvent {
    if (typeof PointerEvent !== "undefined" && event instanceof PointerEvent)
        return event

    warning(
        true,
        "Use of MouseEvent and TouchEvents is deprecated and will be removed in 3.0. Provide a PointerEvent instead."
    )

    return (event as TouchEvent).touches
        ? convertTouchToPointer(event as TouchEvent)
        : convertMouseToPointer(event as MouseEvent)
}
