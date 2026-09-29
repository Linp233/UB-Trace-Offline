public class P0802 {
    static class Node {
        int value;
        Node left, right;
        Node(int value, Node left, Node right) {
            this.value = value;
            this.left = left;
            this.right = right;
        }
    }
    static void visit(Node node) {
        if (node == null) return;
        visit(node.left);
        System.out.println(node.value);
        visit(node.right);
    }
    public static void main(String[] args) throws Exception {
        Node left = new Node(1, null, null);
        Node right = new Node(3, null, null);
        Node root = new Node(2, left, right);
        visit(root);
    }
}
