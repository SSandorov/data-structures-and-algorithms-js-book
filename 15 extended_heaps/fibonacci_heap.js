const goesHigher = (a, b) => a > b;

const newFibonacciHeap = () => ({
  top: undefined,
  trees: []
});

const newNode = (key) => ({
  key,
  degree: 0,
  marked: false,
  left: null,
  right: null,
  down: null,
  up: null
});

const isEmpty = (heap) => heap.trees.length === 0;

const top = (heap) => (isEmpty(heap) ? undefined : heap.top);

const _print = (t, s = "", stopT = null) => {
  if (t && t !== stopT) {
    console.log(
      s,
      t.key,
      `${t._marked ? "***" : ""}`,
      `#${t.degree}`,
      t.up ? `P: ${t.up.key}` : ""
    );
    _print(t.down, `${s}  D:`);
    _print(t.right, `${s}  R:`, stopT || t);
  }
};

const print = (heap) => {
  heap.trees.forEach((t, i) => {
    _print(t, `Tree ${i}`);
  });
};

const _mergeA2B = (low, high) => {
  if (high.down) {
    low.right = high.down;
    low.left = high.down.left;
    high.down.left.right = low;
    high.down.left = low;
  }

  low.up = high;
  high.down = low;
  high.degree++;

  return high;
};

const merge = (heap1, heap2) => {
  const merged = [];
  heap1.trees.forEach((v) => {
    merged[v.degree] = v;
  });

  let j = 0;
  while (j < heap2.trees.length) {
    const i = heap2.trees[j].degree;

    if (!(i in merged) || merged[i] === null) {
      merged[i] = heap2.trees[j];
      j++;
    } else {
      if (goesHigher(heap2.trees[j].key, merged[i].key)) {
        heap2.trees[j] = _mergeA2B(merged[i], heap2.trees[j]);
      } else {
        heap2.trees[j] = _mergeA2B(heap2.trees[j], merged[i]);
      }
      merged[i] = null;
    }
  }

  return {
    top: goesHigher(heap1.top, heap2.top) ? heap1.top : heap2.top,
    trees: merged.filter(Boolean)
  };
};

const _findTop = (trees) => {
  let top;
  trees.forEach((v, i) => {
    if (top === undefined || goesHigher(v.key, trees[top].key)) {
      top = i;
    }
  });
  return top;
};

const add = (heap, keyToAdd) => {
  const newHeap = newNode(keyToAdd);

  newHeap.left = newHeap;
  newHeap.right = newHeap;

  heap.trees.push(newHeap);

  if (heap.top === undefined || goesHigher(keyToAdd, heap.top)) {
    heap.top = keyToAdd;
  }

  return [heap, newHeap];
};

const remove = (heap) => {
  if (isEmpty(heap)) {
    throw new Error("Empty heap");
  }

  const heapTop = heap.top;

  const top = _findTop(heap.trees);

  let bt = heap.trees[top].down;

  if (bt && bt.left) {
    // avoid a loop!
    bt.left.right = null;
  }

  while (bt) {
    heap.trees.push(bt);
    const nextBt = bt.right;
    bt.right = bt;
    bt.left = bt;
    bt.up = null;
    bt = nextBt;
  }

  heap.trees.splice(top, 1);
  const newHeap = merge(newFibonacciHeap(), {
    top: undefined,
    trees: heap.trees
  });

  newHeap.top =
    newHeap.trees.length === 0
      ? undefined
      : newHeap.trees[_findTop(newHeap.trees)].key;

  return [newHeap, heapTop];
};

const _separate = (heap, node) => {
  node._marked = false;

  const parent = node.up;
  if (parent) {
    if (node.right === node) {
      parent.down = null;
    } else {
      if (parent.down === node) {
        parent.down = node.right;
      }
      node.left.right = node.right;
      node.right.left = node.left;
    }
    parent.degree--;

    node.up = null;
    node.left = node;
    node.right = node;
    heap.trees.push(node);

    if (parent._marked) {
      _separate(heap, parent);
    } else {
      parent._marked = true;
    }
  }

  if (goesHigher(node.key, heap.top)) {
    heap.top = node.key;
  }
};

const changeKey = (heap, node, newKey) => {
  if (isEmpty(heap)) {
    throw new Error("Heap is empty!");
  } else if (!goesHigher(newKey, node.key)) {
    throw new Error("New value should go higher than old value");
  } else {
    node.key = newKey;
    _separate(heap, node);
  }
};

module.exports = {
  newFibonacciHeap,
  isEmpty,
  add,
  top,
  remove,
  changeKey,
  merge,
  print
};
