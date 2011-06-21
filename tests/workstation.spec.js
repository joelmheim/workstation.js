describe("script", function() {
	it("should have a global variable called workstation", function() {
		expect(workstation).toBeDefined();
	});	
	
	it("global variable should have ast", function() {
		expect(workstation.ast).toBeDefined();
	});
	
	it("global variable should have a runtime", function() {
		expect(workstation.runtime).toBeDefined();
	});
});

describe("abstract syntax tree", function() {
	beforeEach(function() {
		workstation.ast().clear();	
	});
	
	describe("widgets", function() {
		it("should throw exception when index is out of range", function() {
			screen("screen 1", function() {
				label("my label");
			});
			
			var getWidgetFunc = function(index) {
				return function() {
					workstation.ast().lastScreen().getWidget(index);
				}
			}  
			
			expect(getWidgetFunc(-1)).toThrow("Index out of range.");
			expect(getWidgetFunc(100)).toThrow("Index out of range.");
		});
	});
	
	describe("screen", function() {
		it("should have enumerator method for screens", function() {
			screen("screen 1");
		
			expect(workstation.ast().eachScreen).toBeDefined();
		
			var numberOfScreensTouched = 0;
		    workstation.ast().eachScreen(function(screen) {
		    		numberOfScreensTouched++;
		    });
		    expect(numberOfScreensTouched).toEqual(workstation.ast().numberOfScreens()); 
		});
	});
	
	describe("runtime behaviour", function() {
		$([
			"label",
			"textbox",
			"button"
		]).each(function() {
			it("should contain runtime behaviour for " + this, function() {
				var args = { text: "hello" }; 
				removeAllScreens();
				screen("screen 1", function() {
					workstation.ast().lastScreen().addWidget(args, this);	
				});
				
				expect(getWidget(0).runtime).toBeDefined();
				expect(getWidget(0).runtime.text).toThrow("not implemented");
				expect(getWidget(0).runtime.click).toThrow("not implemented");
			});
		});
	});
});

describe("keywords", function() {
	beforeEach(function() {
		workstation.ast().clear();
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
			screen("screen 2");
			
			expect(workstation.ast().numberOfScreens()).toEqual(2);
			expect(getScreen(0).title).toEqual("screen 1");
		});
		
		it("should execute code block", function() {
			blockWasExecuted = false;
			screen("screen 1", function() {
				blockWasExecuted = true;
			});
			
			expect(blockWasExecuted).toBe(true);
		});
	});
	
	describe("label", function() {
		beforeEach(function() {
			screen("screen 1", function() {
				label("hello world");
			});
		});
		
		it("should append to the last screen in the AST", function() {
			expect(getScreen(0).numberOfWidgets()).toEqual(1);
			expect(getScreen(0).getWidget(0).type).toEqual("label");
		});

		it("should set properties", function() {
			expect(getWidget(0).type).toEqual("label");
			expect(getWidget(0).text).toEqual("hello world");
			expect(getWidget(0).style).toBeDefined();
		});
		
		it("should define initial attributes", function() {
			removeAllScreens();
			screen("screen 1", function() {
				label({});
			});
			expect(getWidget(0)).attributesToBeDefined(["id", "text", "style", "type"]);
		});

		it("should not be possible to call if screen keyword is used first", function() {
			removeAllScreens();
			expect(label).toThrow("screen must be defined before label can be added");
		});		
		
		it("should be possible to pass in several args", function() {
			removeAllScreens();
			screen("screen 1", function() {
				label({ id: "lblUsername", text: "Username" });
			});

			expect(getWidget(0).id).toEqual("lblUsername");
			expect(getWidget(0).text).toEqual("Username");
		});
		
		it("should be possible to use string arg convention", function() {
			removeAllScreens();
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
		it("should be appended to the last screen in the AST", function() {
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
	
	describe("button", function() {
		it("should be appended to the last screen in AST", function() {
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
});

function getScreen(index) {
	return workstation.ast().getScreen(index);
}

function lastScreen() {
	return workstation.ast().lastScreen();
}

function getWidget(index) {
	return lastScreen().getWidget(index);
}

function removeAllScreens()
{
	workstation.ast().clear();
}
