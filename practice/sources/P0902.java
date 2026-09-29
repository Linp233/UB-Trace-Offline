public class P0902 {
    public static void main(String[] args) throws Exception {
        int[][] graph = {{1, 2}, {2}, {}};
        int[] queue = new int[3];
        boolean[] seen = new boolean[3];
        int head = 0;
        int tail = 0;
        queue[tail] = 0;
        tail++;
        seen[0] = true;
        while (head < tail) {
            int vertex = queue[head];
            head++;
            System.out.println(vertex);
            for (int next : graph[vertex]) {
                if (!seen[next]) {
                    seen[next] = true;
                    queue[tail] = next;
                    tail++;
                }
            }
        }
    }
}
