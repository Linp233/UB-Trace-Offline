public class AgentRecursionReference {
    static int sum(int n) {
        if (n == 0) {
            return 0;
        }
        int smaller = sum(n - 1);
        return smaller + n;
    }

    public static void main(String[] args) {
        int answer = sum(2);
        System.out.println(answer);
    }
}
