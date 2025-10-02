import { Movement } from "@/types/common";

export type NodeId = string;

export interface ComboNode {
    id: NodeId;
    move: Movement;
    prev: NodeId | null;
    next: NodeId | null;
}

export interface ComboLL {
    head: NodeId | null;
    tail: NodeId | null;
    map: Record<NodeId, ComboNode>;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export function llFromArray(moves: Movement[]): ComboLL {
    const map: Record<NodeId, ComboNode> = {};
    let head: NodeId | null = null;
    let prev: NodeId | null = null;

    for (const mv of moves) {
        const id = uid();
        const node: ComboNode = { id, move: mv, prev, next: null };
        map[id] = node;
        if (!head) head = id;
        if (prev) map[prev].next = id;
        prev = id;
    }
    return { head, tail: prev, map };
}

export function llToArray(ll: ComboLL): { ids: NodeId[]; moves: Movement[] } {
    const ids: NodeId[] = [];
    const moves: Movement[] = [];
    let cur = ll.head;
    while (cur) {
        const n = ll.map[cur];
        ids.push(n.id);
        moves.push(n.move);
        cur = n.next;
    }
    return { ids, moves };
}

function cloneLL(ll: ComboLL): ComboLL {
    const next: ComboLL = { head: ll.head, tail: ll.tail, map: {} };
    for (const [id, node] of Object.entries(ll.map)) {
        next.map[id] = { ...node };
    }
    return next;
}

function detach(ll: ComboLL, id: NodeId) {
    const n = ll.map[id];
    if (!n) return;
    if (n.prev) ll.map[n.prev].next = n.next; else ll.head = n.next;
    if (n.next) ll.map[n.next].prev = n.prev; else  ll.tail = n.prev;
}

function insertBefore(ll: ComboLL, targetId: NodeId | null, id: NodeId) {
    if (targetId == null) {
        const tail = ll.tail;
        if (!tail) {
            ll.head = ll.tail = id;
            return;
        }
        ll.map[tail].next = id;
        ll.map[id].prev = tail;
        ll.tail = id;
        return;
    }
    const t = ll.map[targetId];
    const p = t.prev;
    ll.map[id].next = targetId;
    ll.map[targetId].prev = id;
    if (p) {
        ll.map[id].prev = p;
        ll.map[p].next = id;
    } else {
        ll.head = id;
    }
}

export function llInsertAt(ll: ComboLL, move: Movement, index: number): ComboLL {
    const next = cloneLL(ll);
    const { ids } = llToArray(next);
    const at = Math.max(0, Math.min(index, ids.length));
    const newId = uid();
    next.map[newId] = { id: newId, move, prev: null, next: null };
    const targetId = at === ids.length ? null : ids[at];
    insertBefore(next, targetId, newId);
    return next;
}

export function llMove(ll: ComboLL, from: number, to: number): ComboLL {
    if (from === to) return ll;
    const next = cloneLL(ll);
    const { ids } = llToArray(next);
    const a = Math.max(0, Math.min(from, ids.length - 1));
    const id = ids[a];
    detach(next, id);
    const idsAfterDetach = ids.filter((x) => x !== id);
    const b = Math.max(0, Math.min(to, idsAfterDetach.length));
    const targetId = b >= idsAfterDetach.length ? null : idsAfterDetach[b];
    insertBefore(next, targetId, id);
    return next;
}

export function llRemoveAt(ll: ComboLL, index: number): ComboLL {
    const next = cloneLL(ll);
    const { ids } = llToArray(next);
    if (index < 0 || index >= ids.length) return next;
    detach(next, ids[index]);
    return next;
}
