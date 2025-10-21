import { NotificationsCategoryProvider, NotificationCategory, INotificationsCategoryProvider } from "./NotificationCategory";

describe("Kinetix-core", () => {
  // Scoped module
  let sut: INotificationsCategoryProvider;

  // Execute once before each tests
  beforeEach(() => {
    sut = new NotificationsCategoryProvider();
  });

  // Execute once after tests
  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  it("should return an array of notificationcategories", () => {
    const categories = sut.getNotificationCategories();
    expect(categories).toEqual(Object.values(NotificationCategory));
  });
});
