describe("keywords", function() {
	beforeEach(function() {
		workstation.reset();
		this.addMatchers({
			attributesToBeDefined: function(attributes) {
				var matches = [];
				for (i = 0; i < attributes.length; i++) {
					for (attribute in this.actual) {
						if (attributes[i] === attribute &&
							typeof this.actual[attributes[i]] !== "undefined") {
							matches.push(true);
							break;
						}
					}
				}
				return matches.length === attributes.length;
			}	
		});
	});
	
	describe("app", function() {
		it("should invoke runtime", function() {
			runtimeWasInvoked = false;
			workstation.runtime = {
				run: function() {
					runtimeWasInvoked = true;	
				}
			}
			app("screen 1");
			
			expect(runtimeWasInvoked).toBe(true);
		});
	});
	
	describe("screen", function() {
		it("should append to the AST", function() {
			screen("screen 1");
			expect(getRootScreen().text).toEqual("screen 1");
		});
		
		it("should execute code block", function() {
			blockWasExecuted = false;
			screen("screen 1", function() {
				blockWasExecuted = true;
			});
			
			expect(blockWasExecuted).toBe(true);
		});
		
		it("should be possible to add child screens", function() {
			screen("root", function() {
				screen("child 1");
				screen("child 2");
			})
			
			expect(workstation.ast().text).toEqual("root");
			expect(workstation.ast().numberOfWidgets()).toEqual(2);
			expect(workstation.ast().getWidget(0).text).toEqual("child 1");
			expect(workstation.ast().getWidget(1).text).toEqual("child 2");
		});


	});
	
	describe("label", function() {
		it("should append to the AST root", function() {
			screen("screen 1", function() {
				label("hello world");
			});
			expect(getRootScreen().numberOfWidgets()).toEqual(1);
			expect(getRootScreen().getWidget(0).type).toEqual("label");
		});

		it("should set properties", function() {
			screen("screen 1", function() {
				label("hello world");
			});
			expect(getWidget(0).type).toEqual("label");
			expect(getWidget(0).text).toEqual("hello world");
			expect(getWidget(0).style).toBeDefined();
		});
		
		it("should define initial attributes", function() {
			screen("screen 1", function() {
				label({});
			});
			expect(getWidget(0)).attributesToBeDefined(["id", "text", "style", "type"]);
		});

		it("should be possible to pass in several args", function() {
			screen("screen 1", function() {
				label({ id: "lblUsername", text: "Username" });
			});

			expect(getWidget(0).id).toEqual("lblUsername");
			expect(getWidget(0).text).toEqual("Username");
		});
		
		it("should be possible to use string arg convention", function() {
			screen("screen 1", function() {
				label("test");
			});
			
			expect(getWidget(0).id).toEqual("labeltest");
			expect(getWidget(0).text).toEqual("test");
			expect(getWidget(0).style).toEqual({});
			expect(getWidget(0).type).toEqual("label");
		});
	});
	
	describe("textbox", function() {
		it("should be appended to AST root", function() {
			screen("screen 1", function() {
				textbox({ id: "Username" });
				textbox();
				textbox({ style: { color: "red" } })
			});
			
			expect(lastScreen().numberOfWidgets()).toEqual(3);
			expect(getWidget(0).id).toEqual("Username");
			expect(getWidget(2).style).toEqual({ color: "red" });
			
			for (i = 0; i < 2; i++) {
				expect(getWidget(i).type).toEqual("textbox");
			}
		});
		
		it("should define initial attributes", function() {
			screen("screen 1", function() {
				textbox({});
			});
			
			expect(getWidget(0)).attributesToBeDefined(["id", "text", "style", "type"]);
		});
	});
	
	describe("passwordfield", function() {
		it("should be appended to AST root", function() {
			screen("screen 1", function() {
				passwordfield({ id: "Password" });
				passwordfield();
				passwordfield({ style: { color: "red" } })
			});
			
			expect(lastScreen().numberOfWidgets()).toEqual(3);
			expect(getWidget(0).id).toEqual("Password");
			expect(getWidget(2).style).toEqual({ color: "red" });
			
			for (i = 0; i < 2; i++) {
				expect(getWidget(i).type).toEqual("passwordfield");
			}
		});
		
		it("should define initial attributes", function() {
			screen("screen 1", function() {
				passwordfield({});
			});
			
			expect(getWidget(0)).attributesToBeDefined(["id", "text", "style", "type"]);
		});
	});
	
	describe("button", function() {
		it("should be appended to AST root", function() {
			screen("screen 1", function() {
				button({ text: "Click me" });
				button("Click me to");
				button({ id: "btnLogin", text: "Login" });
			});
			
			expect(lastScreen().numberOfWidgets()).toEqual(3);
			expect(getWidget(0).text).toEqual("Click me");
			expect(getWidget(1).text).toEqual("Click me to");
			expect(getWidget(2).id).toEqual("btnLogin");
			
			for (i = 0; i < 2; i++) {
				expect(getWidget(i).type).toEqual("button");
			}
		});
		
		it("should define initial attributes", function() {
			screen("screen 1", function() {
				button({});
			});
			
			expect(getWidget(0)).attributesToBeDefined(["id", "text", "style", "type"]);
		});
		
		it("should be possible to style", function() {
			screen("screen 1", function() {
				button({ text: "hello", style: { color: "red" }})
			});
			
			expect(getWidget(0).style).toBeDefined();
			expect(getWidget(0).style).toEqual({ color: "red" });
		});
		
		xit("id should be generated based on text, if not specified (convetion)", function() {
			screen("screen 1", function() {
				button("Login");
				button({ text: "Click me" });
				button("&#$&$%$%//&((&#yo123))");
			});
			
			expect(getWidget(0).id).toEqual("btnLogin");
			expect(getWidget(1).id).toEqual("btnClickme")
			expect(getWidget(2).id).toEqual("yo123");
		});
		
		it("should be possible to add code block for onclick", function() {
			var onClickInvoked = false;
			screen("screen 1", function() {
				button({ text: "test", onclick: function() {
					onClickInvoked = true;
				} });
			});
			
			expect(getWidget(0).onclick).toBeDefined();
			
			getWidget(0).onclick();
			expect(onClickInvoked).toEqual(true);
		});
	});
	
	describe("table", function() {
		it("should invoke code block", function() {
			var codeBlockWasInvoked = false;
			var secondCodeBlockWasInvoked = false;
			screen("screen 1", function() {
				table("t", function() {
					codeBlockWasInvoked = true;
				});
				table(function() {
					secondCodeBlockWasInvoked = true;
				});
			});
			
			expect(codeBlockWasInvoked).toEqual(true);
			expect(secondCodeBlockWasInvoked).toEqual(true);
		});
		
		it("should append to AST", function() {
			screen("screen 1", function() {
				table();
				table(function() {});
				table("Menu", function() {});
				table({ id: "menu", text: "Menu" }, function() {});
			});
			
			var numberOfExpectedTables = 4;
			expect(workstation.ast().numberOfWidgets()).toEqual(numberOfExpectedTables);
			for (var i = 0; i < numberOfExpectedTables; i++) {
				expect(getWidget(i).type).toEqual("table");
			}
		});
	});
	
	
	describe("row", function() {
		it("should append to the last added table", function() {
			screen("screen 1", function() {
				table("Menu", function() {
					row("Help");
				});
				//screen("child screen", function() {
					table("Options", function() {
						row("Yes");
						row("No");
						row("Don't know");
					});
				//});
			});
			
			var firstTable = workstation.ast().getWidget(0);
			var secondTable = workstation.ast().getWidget(1);
			expect(firstTable.numberOfWidgets()).toEqual(1);
			expect(firstTable.type).toEqual("table");
			expect(firstTable.getWidget(0).type).toEqual("row");
			expect(secondTable.type).toEqual("table");
			expect(secondTable.numberOfWidgets()).toEqual(3);
			for (var i = 0; i < 3; i++) {
				expect(secondTable.getWidget(i).type).toEqual("row");
			}
		});
	});
});