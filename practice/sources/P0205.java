public class P0205 {
    public static void main(String[] args) throws Exception {
        String text = java.nio.file.Files.readString(java.nio.file.Path.of("P0205.csv")).trim();
        String[] fields = text.split(",");
        int quantity = Integer.parseInt(fields[1]);
        int price = Integer.parseInt(fields[2]);
        int total = quantity * price;
        System.out.println(fields[0] + ":" + total);
    }
}
