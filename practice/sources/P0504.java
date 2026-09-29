public class P0504 {
    static class Base {
        int value = 2;
        Base() {   }
    }
    static class Child extends Base {
        int value = 9;
        Child() { super();   }
    }
    public static void main(String[] args) throws Exception {
        Child c = new Child();
        Base b = c;
        int first = b.value;
        int second = c.value;
        System.out.println(first + second);
    }
}
