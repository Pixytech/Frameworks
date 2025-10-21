// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { createMock } from "ts-auto-mock";
import { cleanup, screen, fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { IAuthenticationService, IAuthenticationServiceType, IContainer, INavigationService, NavigationServiceView, NavigationRoutes, UnAuthorized } from "../..";

import { arrange, clearStubs, Func, hostComponent, stubComponent } from "../../../../../testing";

import { Window } from "@progress/kendo-react-dialogs";
import { IApmService, IApmServiceType } from "../../Apm/IApmService";
import { DefaultApmAdapter } from "../../Apm/Adapters/DefaultAdapter";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module

  let mockNavigationService: INavigationService;
  let mockAuthenticationService: IAuthenticationService;
  let mockApmService: IApmService;
  let mockContainer: IContainer;

  beforeEach(() => {
    mockAuthenticationService = createMock<IAuthenticationService>();
    mockNavigationService = createMock<INavigationService>();
    mockApmService = createMock<IApmService>();
    mockContainer = createMock<IContainer>();
    arrange(mockContainer).stubMethod("build", () => mockAuthenticationService, [IAuthenticationServiceType]);

    arrange(mockContainer).stubMethod("build", () => mockApmService, [IApmServiceType]);

    arrange(mockApmService).stubProperty("Apm", () => {
      return new DefaultApmAdapter();
    });
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    clearStubs();
  });

  // Testing Component
  describe("NavigationServiceView", () => {
    // TEST:  Kinetix Core > NavigationServiceView > component should be created without style attribute
    it("component should be created without style attribute", async () => {
      //stub component with optional new implementation
      const mockNavigationRoutes = stubComponent<typeof NavigationRoutes>(
        "NavigationRoutes",
        "../../packages/kinetix-core/src/Components/NavigationService/NavigationRoutes"
        /* (props) => <>{props.routes.filter((x) => x.path === "*")[0].element}</> */
      );

      //stub component with optional new implementation
      const mockWindow = stubComponent<typeof Window>(
        "Window",
        "@progress/kendo-react-dialogs"
        /* (props) => {
          console.log("Window Props", props);
          // eslint-disable-next-line testing-library/no-node-access
          const children: any[] = Array.isArray(props.children)
            ? // eslint-disable-next-line testing-library/no-node-access
              [...props.children]
            : // eslint-disable-next-line testing-library/no-node-access
              [props.children];
          return (
            <div>
              {children.map((c, i) => (
                <div key={`child${i}`}>{c}</div>
              ))}
            </div>
          );
        } */
      );
     
      arrange(mockNavigationService).stubProperty("appsRoutes", () => {
        return[ {
          path: "test",
          element: ()=><div></div>,
          routes: [],
        },
        { path: "*", element: ()=><UnAuthorized /> }
      ];
      });

      let sut = hostComponent(<NavigationServiceView dataContext={mockNavigationService} />, mockContainer);

      const view = render(sut);
      // uncomment to see the html code
      // screen.debug();

      let button = screen.getByTestId("logout-button");

      fireEvent.click(button);
      expect(view).not.toBeNull();
      expect(mockWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          children: expect.anything(),
          closeButton: expect.anything(),
          maximizeButton: expect.anything(),
          minimizeButton: expect.anything(),
          modal: true,
          resizable: false,
          restoreButton: expect.anything(),
          title: expect.anything(),
        }),
        expect.anything()
      );
      expect(mockNavigationRoutes).toBeCalled();
      expect(mockAuthenticationService.DoLogout).toBeCalled();
      expect(mockNavigationRoutes).toHaveBeenCalledWith(
        {
          routes: expect.arrayContaining([
            expect.objectContaining({
              element: expect.anything(),
              path: "test",
              routes: [],
            }),
            expect.objectContaining({ path: "*", element: expect.anything() }),
          ]),
        },
        expect.anything()
      );

      const windowProps = mockWindow.mock.calls[0][0];
      expect((windowProps.closeButton as Func)()).toEqual(null);
      expect((windowProps.maximizeButton as Func)()).toEqual(null);
      expect((windowProps.minimizeButton as Func)()).toEqual(null);
      expect((windowProps.restoreButton as Func)()).toEqual(null);
    });
  });
});
