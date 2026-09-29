public class P0805 {
    static class Node {
        int value;
        Node left, right;
        Node(int value, Node left, Node right) {
            this.value = value;
            this.left = left;
            this.right = right;
        }
    }
    static Node insert(Node node, int value) {
        if (node == null) {
            Node made = new Node(value, null, null);
            return made;
        }
        if (value < node.value) {
            node.left = insert(node.left, value);
        }
        return node;
    }
    public static void main(String[] args) throws Exception {
        Node root = new Node(5, null, null);
        root = insert(root, 3);
        System.out.println(root.left.value);
    }
}
