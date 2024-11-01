// 定义红黑树
class RBTree {
  // 颜色枚举
  static ERBTNodeColor = Object.freeze({
    RED: 'RED',
    BLACK: 'BLACK',
  });

  // 指针方向
  static EChildPosition = Object.freeze({
    LEFT: 'left',
    RIGHT: 'right',
  });

  // NIL KEY
  static NIL_KEY = 'NIL';

  // 生成NIL节点
  static generateNILNode() {
    return {
      key: RBTree.NIL_KEY,
      // NIL节点颜色为黑色
      color: RBTree.ERBTNodeColor.BLACK,
    };
  }

  // 生成树节点
  static generateRBNode(key, value) {
    return {
      key,
      value,
      left: RBTree.generateNILNode(),
      right: RBTree.generateNILNode(),
      parent: null,
      // 普通节点默认颜色为红色
      color: RBTree.ERBTNodeColor.RED,
    };
  }

  // 构造方法
  constructor() {
    // 定义树根
    this.root = null;
  }

  /** ------------- 内部方法 --------------- */
  /**
   * 判断节点收否为空或外部(NIL)节点
   * @param {*} node
   */
  _isNodeNull(node) {
    if (!node || node.key === RBTree.NIL_KEY) {
      return true;
    }
    return false;
  }

  /**
   * 根据传入的根节点和key查找对应的树节点
   * @param {*} root 根节点或子树节点
   * @param {*} key 节点key值
   * @returns
   */
  _findTreeNodeByKey(root, key) {
    if (this._isNodeNull(root)) return;
    let current = root;
    if (current.key === key) {
      // 找到 返回节点
      return current;
    } else if (current.key > key) {
      // 找左子树
      return this._findTreeNodeByKey(root.left, key);
    } else {
      // 找右子树
      return this._findTreeNodeByKey(root.right, key);
    }
  }

  /**
   * 根据传入的根节点和key查找要插入到的节点
   * @param {*} root 根节点或子树节点
   * @param {*} key 节点key值
   * @returns [插入节点，插入位置（左右）]
   */
  _findInsertTreeNodeByKey(root, key) {
    if (this._isNodeNull(root)) return [];
    let current = root;
    let previous = null;
    // 默认插入左边,相同的也默认插入左边
    let childPosition = RBTree.EChildPosition.LEFT;
    while (!this._isNodeNull(current)) {
      if (current.key === key) {
        childPosition = RBTree.EChildPosition.LEFT;
        previous = current;
        break;
      } else if (current.key < key) {
        // 找右子树
        childPosition = RBTree.EChildPosition.RIGHT;
        previous = current;
        current = current[childPosition];
        continue;
      } else {
        // 找左子树
        childPosition = RBTree.EChildPosition.LEFT;
        previous = current;
        current = current[childPosition];
        continue;
      }
    }
    return [previous, childPosition];
  }

  /**
   * 将待插入节点插入被插入节点
   * @param {*} insertedNode 被插入节点
   * @param {*} insertPostion 被插入位置 左/右
   * @param {*} toBeInsertedNode 待插入节点
   */
  _insertNode(insertedNode, insertPostion, toBeInsertedNode) {
    if (!insertedNode || !insertPostion || !toBeInsertedNode) return;
    insertedNode[insertPostion] = toBeInsertedNode;
    toBeInsertedNode.parent = insertedNode;
  }

  /**
   * 找到节点在父节点的位置
   * @param {*} parent 父节点
   * @param {*} node 子节点
   * return postion 左/右/(null 不存在父子关系)
   */
  _getNodePositionInParent(parent, node) {
    if (parent.left === node) {
      return RBTree.EChildPosition.LEFT;
    } else if (parent.right === node) {
      return RBTree.EChildPosition.RIGHT;
    } else {
      return null;
    }
  }

  /**
   * 获取兄弟节点
   * @param {*} node
   * return [兄弟节点，兄弟节点位置 (左/右)]
   */
  _getBortherNode(node) {
    const parent = node.parent;
    if (!parent) return;
    const nodePosition = this._getNodePositionInParent(parent, node);
    const brotherPosition =
      nodePosition === RBTree.EChildPosition.LEFT
        ? RBTree.EChildPosition.RIGHT
        : RBTree.EChildPosition.LEFT;
    return [parent[brotherPosition], brotherPosition];
  }

  /**
   * 找到节点的后继节点
   * @param {*} node
   */
  _getSuccessor(node) {
    if (this._isNodeNull(node)) return;
    let current = node.right;
    let parent = null;
    while (!this._isNodeNull(current)) {
      parent = current;
      current = current.left;
    }
    return parent;
  }

  /**
   * 右旋函数： 例如下
   *           |        |
   *         axis  ->   node
   *       /               \
   *    node               axis
   * @param {*} axisNode
   * @param {*} node
   */
  _rightRound(axisNode, node) {
    if (axisNode.parent === null) {
      // root节点
      this.root = node;
      node.parent = null;
    } else {
      const axisNodeInParentPosition = this._getNodePositionInParent(axisNode.parent, axisNode);
      this._insertNode(axisNode.parent, axisNodeInParentPosition, node);
    }
    if (node.right) {
      // 挂载node右节点到axisNode左节点
      this._insertNode(axisNode, RBTree.EChildPosition.LEFT, node.right);
    }
    this._insertNode(node, RBTree.EChildPosition.RIGHT, axisNode);
  }

  /**
   * 左旋函数： 例如下
   *  |                 |
   *  axis     ->     node
   *     \            /
   *    node       axis
   * @param {*} axisNode
   * @param {*} node
   */
  _leftRound(axisNode, node) {
    if (axisNode.parent === null) {
      // root节点
      this.root = node;
      node.parent = null;
    } else {
      const axisNodeInParentPosition = this._getNodePositionInParent(axisNode.parent, axisNode);
      this._insertNode(axisNode.parent, axisNodeInParentPosition, node);
    }
    if (node.left) {
      // 挂载node左节点到axisNode右节点
      this._insertNode(axisNode, RBTree.EChildPosition.RIGHT, node.left);
    }
    this._insertNode(node, RBTree.EChildPosition.LEFT, axisNode);
  }

  /** 插入处理 */
  // 判断是否是插入情况3 即 祖先为黑，符节点和叔叔节点为红
  _isGrandParentBlackAndBothChildRed(grandParent, parent, uncle) {
    return (
      parent.color === RBTree.ERBTNodeColor.RED &&
      uncle.color === RBTree.ERBTNodeColor.RED &&
      grandParent.color === RBTree.ERBTNodeColor.BLACK
    );
  }

  // 判断 情况 4 5： 父节点红，叔节点黑，祖先节点黑
  _isParentRedAndGrandParentUncleBlack(grandParent, parent, uncle) {
    return (
      parent.color === RBTree.ERBTNodeColor.RED &&
      uncle.color === RBTree.ERBTNodeColor.BLACK &&
      grandParent.color === RBTree.ERBTNodeColor.BLACK
    );
  }

  /**
   * 调节红色节点插入
   * @param  adjustNode
   * @returns
   */
  _adjustInsertToRed(adjustNode) {
    // 1. 新节点的parent 也就是找到的插入节点
    const parent = adjustNode.parent;
    // 2. 祖先节点，插入节点的父亲
    const grandParent = parent.parent;
    // 要调整节点位置
    const adjustNodePosition = this._getNodePositionInParent(parent, adjustNode);
    // 父节点位置
    const parentPosition = this._getNodePositionInParent(grandParent, parent);
    // 3. 叔叔节点,叔叔节点位置
    const [uncle] = this._getBortherNode(parent);

    // 情况3,叔叔节点，父节点都是红色，祖先节点是黑色
    if (this._isGrandParentBlackAndBothChildRed(grandParent, parent, uncle)) {
      uncle.color = parent.color = RBTree.ERBTNodeColor.BLACK;
      grandParent.color = RBTree.ERBTNodeColor.RED;
      if (grandParent === this.root) {
        // 递归到root节点 停止
        grandParent.color = RBTree.ERBTNodeColor.BLACK;
        return;
      }
      if (
        grandParent.parent &&
        grandParent.parent?.color &&
        grandParent.parent.color === RBTree.ERBTNodeColor.RED
      ) {
        this._adjustInsertToRed(grandParent);
      }
      return;
    }

    // 情况 4 5 父节点红，叔节点黑，祖先节点黑
    if (this._isParentRedAndGrandParentUncleBlack(grandParent, parent, uncle)) {
      // LL/RR 即：父节点在祖先节点左，插入节点在父节点左 ｜ 父节点在祖先节点右，插入节点在爷节点右
      // LL grandparent为axis对parent右旋 + 父节点黑，祖先节点红
      if (
        parentPosition === RBTree.EChildPosition.LEFT &&
        adjustNodePosition === RBTree.EChildPosition.LEFT
      ) {
        this._rightRound(grandParent, parent);
        // 上色
        parent.color = RBTree.ERBTNodeColor.BLACK;
        grandParent.color = RBTree.ERBTNodeColor.RED;
      }

      // RR grandparent为axis对parent左旋 + 父节点黑，祖先节点红
      if (
        parentPosition === RBTree.EChildPosition.RIGHT &&
        adjustNodePosition === RBTree.EChildPosition.RIGHT
      ) {
        this._leftRound(grandParent, parent);
        // 上色
        parent.color = RBTree.ERBTNodeColor.BLACK;
        grandParent.color = RBTree.ERBTNodeColor.RED;
      }

      // LR/RL 即：父节点在祖先节点左，插入节点在父节点右 ｜ 父节点在祖先节点右，插入节点在爷节点左
      // LR 先以parent为axis 对新插入节点左旋，再以grandParent为axis对新插入节点右旋
      // newNode上色为黑，grandParent上色为红
      if (
        parentPosition === RBTree.EChildPosition.LEFT &&
        adjustNodePosition === RBTree.EChildPosition.RIGHT
      ) {
        // 左旋
        this._leftRound(parent, adjustNode);
        // 右旋
        this._rightRound(grandParent, adjustNode);
        // 上色
        adjustNode.color = RBTree.ERBTNodeColor.BLACK;
        grandParent.color = RBTree.ERBTNodeColor.RED;
      }

      // RL 先以parent为axis 对新插入节点右旋，再以grandParent为axis对新插入节点左旋
      if (
        parentPosition === RBTree.EChildPosition.RIGHT &&
        adjustNodePosition === RBTree.EChildPosition.LEFT
      ) {
        // 右旋
        this._rightRound(parent, adjustNode);
        // 左旋
        this._leftRound(grandParent, adjustNode);
        // 上色
        adjustNode.color = RBTree.ERBTNodeColor.BLACK;
        grandParent.color = RBTree.ERBTNodeColor.RED;
      }
    }
  }

  /** 删除处理 */

  /**
   * 获取非双孩子节点的孩子和位置
   * @param {*} node
   * return [childNode,position]
   */
  _getNoNDoubleChildNode(node) {
    if (this._isNodeNull(node)) return [];
    let childPosition;
    if (!this._isNodeNull(node[RBTree.EChildPosition.LEFT])) {
      // 说明左孩子为空
      childPosition = RBTree.EChildPosition.LEFT;
    } else if (!this._isNodeNull(node[RBTree.EChildPosition.RIGHT])) {
      // 说明左孩子为空
      childPosition = RBTree.EChildPosition.RIGHT;
    } else {
      childPosition = null;
    }
    if (!childPosition) return [];
    return [node[childPosition], childPosition];
  }

  /**
   * 删除非双孩子节点
   * @param {*} toBeDeletedNode
   */
  _deleteNoNDoubleChildNode(toBeDeletedNode) {
    if (this._isNodeNull(toBeDeletedNode)) return false;
    // 如果是跟节点的情况，直接删除
    if (toBeDeletedNode === this.root) {
      this.root = null;
      return true;
    }
    // 不是跟节点
    const [child] = this._getNoNDoubleChildNode(toBeDeletedNode);
    let deletedNodePosition = this._getNodePositionInParent(
      toBeDeletedNode.parent,
      toBeDeletedNode,
    );
    if (!child) {
      // 无孩子的情况，创建NIL节点
      this._insertNode(toBeDeletedNode.parent, deletedNodePosition, RBTree.generateNILNode());
    } else {
      this._insertNode(toBeDeletedNode.parent, deletedNodePosition, child);
    }
    return true;
  }

  /**
   * 调节黑-黑 （缺少黑色情况）
   * @param  toBeDeletedNode
   * @returns
   */
  _adjustDeleteDoubleBlack(toBeDeletedNode) {
    if (this._isNodeNull(toBeDeletedNode)) return;
    if (toBeDeletedNode === this.root) {
      toBeDeletedNode.color = RBTree.ERBTNodeColor.BLACK;
      return; // 到跟节点停止调整
    }
    // 获取父节点
    const parent = toBeDeletedNode.parent;
    // 获取兄弟节点
    const [brother, brotherPosition] = this._getBortherNode(toBeDeletedNode);

    // case 3 如果待删除节点黑 兄弟节点红，需要先调整，再删除
    if (brother.color === RBTree.ERBTNodeColor.RED) {
      // 兄弟节点在右边，以parent为axis 左旋兄弟节点，并且将兄弟颜色改成黑色，parent改成红色
      if (brotherPosition === RBTree.EChildPosition.RIGHT) {
        this._leftRound(parent, brother);
        parent.color = RBTree.ERBTNodeColor.RED;
        brother.color = RBTree.ERBTNodeColor.BLACK;
      }
      // 兄弟节点在左边，以parent为axis 右旋兄弟节点，并且将兄弟颜色改成黑色，parent改成红色
      else if (brotherPosition === RBTree.EChildPosition.LEFT) {
        this._rightRound(parent, brother);
        parent.color = RBTree.ERBTNodeColor.RED;
        brother.color = RBTree.ERBTNodeColor.BLACK;
      }
      // 重新调用删除操作
      return this._deleteNode(toBeDeletedNode);
    }

    // 定义左侄子
    const leftNephew = brother.left;
    // 定义右侄子
    const rightNephew = brother.right;
    // case 4 左右侄子都是黑色
    if (
      rightNephew.color === RBTree.ERBTNodeColor.BLACK &&
      leftNephew.color === RBTree.ERBTNodeColor.BLACK
    ) {
      // 兄弟节点置红
      brother.color = RBTree.ERBTNodeColor.RED;
      //父节点要判断，如果是红色置黑 结束，如果是黑色，继续调整
      if (parent.color === RBTree.ERBTNodeColor.RED) {
        parent.color = RBTree.ERBTNodeColor.BLACK;
        return;
      } else if (parent.color === RBTree.ERBTNodeColor.BLACK) {
        // 继续调整parent
        return this._adjustDeleteDoubleBlack(parent);
      }
      return;
    }
    // case 左右侄子存在红色
    if (
      rightNephew.color === RBTree.ERBTNodeColor.RED ||
      leftNephew.color === RBTree.ERBTNodeColor.RED
    ) {
      // L兄弟在父左
      if (brotherPosition === RBTree.EChildPosition.LEFT) {
        // LL 兄弟左边存在侄子 右旋brother  parent为axis brother为parent颜色leftNephew和parent颜色黑
        if (leftNephew.color === RBTree.ERBTNodeColor.RED) {
          this._rightRound(parent, brother);
          brother.color = parent.color;
          leftNephew.color = parent.color = RBTree.ERBTNodeColor.BLACK;
        }
        // LR 兄弟右边存在侄子 先以brother为axis左旋rightNephew，再用parent为axis右旋rightNephew rightNephew为parent颜色 brother和parent都是黑色
        else {
          this._leftRound(brother, rightNephew);
          this._rightRound(parent, rightNephew);
          rightNephew.color = parent.color;
          brother.color = parent.color = RBTree.ERBTNodeColor.BLACK;
        }
      } else {
        // RR 兄弟右边存在侄子 左旋brother  parent为axis brother为parent颜色rightNephew和parent颜色黑
        if (rightNephew.color === RBTree.ERBTNodeColor.RED) {
          this._leftRound(parent, brother);
          brother.color = parent.color;
          rightNephew.color = parent.color = RBTree.ERBTNodeColor.BLACK;
        }
        // RL 兄弟左边存在侄子 先以brother为axis右旋leftNephew，再用parent为axis左旋leftNephew leftNephew为parent颜色 brother和parent都是黑色
        this._rightRound(brother, leftNephew);
        this._leftRound(parent, leftNephew);
        leftNephew.color = parent.color;
        brother.color = parent.color = RBTree.ERBTNodeColor.BLACK;
      }
      return;
    }
  }

  /**
   * 删除节点
   * @param {*} toBeDeletedNode 待删除节点
   */
  _deleteNode(toBeDeletedNode) {
    if (this._isNodeNull(toBeDeletedNode)) return false;
    // 如果待删除节点有两个子节点，找到其后继节点，并且交换，转换成删除其后继节点
    if (!this._isNodeNull(toBeDeletedNode.left) && !this._isNodeNull(toBeDeletedNode.right)) {
      const successor = this._getSuccessor(toBeDeletedNode);
      if (this._isNodeNull(successor)) return false;
      // 交换待删除节点和后继节点key值
      const temp = [successor.key, successor.value];
      successor.key = toBeDeletedNode.key;
      successor.value = toBeDeletedNode.value;
      toBeDeletedNode.key = temp[0];
      toBeDeletedNode.value = temp[1];
      // 转换成对只有一个或0个子节点后继节点删除的过程
      // 递归调用此函数
      return this._deleteNode(successor);
    } else {
      // 待删除节点最多有一个孩子
      // case 1 如果待删除的是跟节点
      if (toBeDeletedNode === this.root) {
        this.root = null;
        return true;
      }
      // 如果待删除节点为红色，直接删除
      if (toBeDeletedNode.color === RBTree.ERBTNodeColor.RED) {
        return this._deleteNoNDoubleChildNode(toBeDeletedNode);
      }

      // 如果被删除的节点是黑色的
      // case 2 如果剩下的节点是红色的，可以将红色改成黑色 保证黑色数量不变
      const [remainingNode] = this._getNoNDoubleChildNode(toBeDeletedNode);
      if (remainingNode && remainingNode.color === RBTree.ERBTNodeColor.RED) {
        remainingNode.color = RBTree.ERBTNodeColor.BLACK;
        return this._deleteNoNDoubleChildNode(toBeDeletedNode);
      }

      // 如果删除节点是黑色的 并且其子节点也是黑色的，那么会出现缺少黑色问题 - 黑黑
      this._adjustDeleteDoubleBlack(toBeDeletedNode);
      return this._deleteNoNDoubleChildNode(toBeDeletedNode);
    }
  }

  /** 遍历相关 */
  /** 先序遍历生成器函数 */
  *preOrderGenerator() {
    if (this.root === null) return undefined;
    const stack = [this.root];
    while (stack?.length > 0) {
      const node = stack.pop();
      yield [node.key, node.value];
      if (!this._isNodeNull(node.right)) {
        stack.push(node.right);
      }
      if (!this._isNodeNull(node.left)) {
        stack.push(node.left);
      }
    }
  }

  /** 中序遍历生成器函数 */
  *_InOrderGenerator() {
    if (this.root === null) return undefined;
    const stack = [];
    const handleLeft = (node) => {
      let current = node;
      while (!this._isNodeNull(current)) {
        stack.push(current);
        current = current.left;
      }
    };
    handleLeft(this.root);
    while (stack.length > 0) {
      const node = stack.pop();
      yield [node.key, node.value];
      if (node.right) {
        handleLeft(node.right);
      }
    }
  }

  /** 后序遍历生成器函数 */
  *postOrderGenerator() {
    if (this.root === null) return undefined;
    const stack = [this.root];
    while (stack?.length > 0) {
      const node = stack.pop();
      yield [node.key, node.value];
      if (!this._isNodeNull(node.right)) {
        stack.push(node.right);
      }
      if (!this._isNodeNull(node.left)) {
        stack.push(node.left);
      }
    }
  }

  /** 前序遍历方法 */
  _perOrderTraversalNodes(node, callback) {
    if (this._isNodeNull(node)) return;
    callback(node.key, node.value, node.color);
    this._perOrderTraversalNodes(node.left, callback);
    this._perOrderTraversalNodes(node.right, callback);
  }

  /** 中序遍历方法 */
  _inOrderTraversalNodes(node, callback) {
    if (this._isNodeNull(node)) return;
    this._perOrderTraversalNodes(node.left, callback);
    callback(node.key, node.value, node.color);
    this._perOrderTraversalNodes(node.right, callback);
  }

  /** 后序遍历方法 */
  _postOrderTraversalNodes(node, callback) {
    if (this._isNodeNull(node)) return;
    this._perOrderTraversalNodes(node.left, callback);
    this._perOrderTraversalNodes(node.right, callback);
    callback(node.key, node.value, node.color);
  }

  /** 默认遍历回调 */
  _defaultTraversalCallback(key, value) {
    // console.log({
    //   key,
    //   value,
    // });
  }

  /** ------------- 外部暴露方法 --------------- */
  // 树是否空
  empty() {
    return !!(this.root === null);
  }

  // 插入节点
  insert(key, value) {
    // 生成一个普通节点
    const newNode = RBTree.generateRBNode(key, value);
    // 情况1: 空树情况，设置根节点
    if (this.empty()) {
      this.root = newNode;
      // 根节点颜色必须是黑色
      newNode.color = RBTree.ERBTNodeColor.BLACK;
      return;
    }
    // 找到要插入的节点和位置
    const [insertNode, insertPosition] = this._findInsertTreeNodeByKey(this.root, newNode.key);

    // 情况2: 如果要插入的节点是黑色，直接插入，无需任何调整
    if (insertNode.color === RBTree.ERBTNodeColor.BLACK) {
      this._insertNode(insertNode, insertPosition, newNode);
      // 设置parent指针
      return;
    }

    // 如果插入节点是红色的情况 （此时插入节点一定不是根，因为根节点必须是黑色）
    if (insertNode.color === RBTree.ERBTNodeColor.RED) {
      // 插入
      this._insertNode(insertNode, insertPosition, newNode);
      // 调整插入到红节点
      this._adjustInsertToRed(newNode);
    }
  }

  // 删除节点
  delete(key) {
    const toBeDeletedNode = this._findTreeNodeByKey(this.root, key);
    if (!toBeDeletedNode) return false;
    this._deleteNode(toBeDeletedNode);
  }

  // 搜索节点
  search(key) {
    return this._findTreeNodeByKey(this.root, key);
  }

  // 前序遍历
  preOrderTraversal(callback = this._defaultTraversalCallback) {
    this._perOrderTraversalNodes(this.root, callback);
  }

  // 中序遍历
  inOrderTraversal(callback = this._defaultTraversalCallback) {
    this._inOrderTraversalNodes(this.root, callback);
  }

  // 后序遍历
  postOrderTraversal(callback = this._defaultTraversalCallback) {
    this._postOrderTraversalNodes(this.root, callback);
  }

  // 最小值
  min() {
    if (null === this.root) return;
    let current = this.root;
    let previous = null;
    while (!this._isNodeNull(current)) {
      previous = current;
      current = current.left;
    }
    return { key: previous.key, value: previous.value };
  }

  // 最大值
  max() {
    if (null === this.root) return;
    let current = this.root;
    let previous = null;
    while (!this._isNodeNull(current)) {
      previous = current;
      current = current.right;
    }
    return { key: previous.key, value: previous.value };
  }

  /** 可迭代 */
  [Symbol.iterator] = () => this._InOrderGenerator(this.root);
  // [Symbol.iterator] = () => this.preOrderGenerator(this.root);
}

export default class quickMap {
  constructor() {
    this.store = new RBTree();
    this.length = 0;
  }

  set(key, value) {
    this.store.insert(key, value);
    this.length++;
  }

  get(key) {
    return this.store.search(key)?.value;
  }

  delete(key) {
    return this.store.delete(key);
  }

  has(key) {
    return !!this.store.search(key)?.value;
  }

  clear() {
    this.store.clear();
  }

  *[Symbol.iterator]() {
    yield* this.store;
  }
}
