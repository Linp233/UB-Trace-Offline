public class P0803 {
    static class Node {
        int value;
        Node left, right;
        Node(int value, Node left, Node right) {
            this.value = value;
            this.left = left;
            this.right = right;
        }
    }
    static int size(Node node) {
        if (node == null) return 0;
        int leftSize = size(node.left);
        int rightSize = size(node.right);
        return 1 + leftSize + rightSize;
    }
    public static void main(String[] args) throws Exception {
        Node left = new Node(1, null, null);
        Node right = new Node(3, null, null);
        Node root = new Node(2, left, right);
        int result = size(root);
        System.out.println(result);
    }
}
