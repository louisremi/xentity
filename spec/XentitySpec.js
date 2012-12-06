describe("xentity", function() {

	it("can be initialized with a node", function() {
		var x = xentity( document.body );
		expect( x[0] ).toEqual( document.body );
		expect( x.length ).toEqual( 1 );
	});

	it("can be initialized with a collection of node", function() {
		var x = xentity( document.querySelectorAll("#ul0 > li") );
		expect( x[0] ).toEqual(  document.querySelector("#ul0 > li") );
		expect( x.length ).toEqual( 3 );
	});

	it("can be initialized with a selector", function() {
		var x = xentity( "#ul0 > li" );
		expect( x[0] ).toEqual(  document.querySelector("#ul0 > li") );
		expect( x.length ).toEqual( 3 );
	});

	/*it("should detect the components of the first node in the collection", function() {
		expect( "not implemented yet" ).toBeTruthy();
	});*/

	/*describe("when song has been paused", function() {
		beforeEach(function() {
			player.play(song);
			player.pause();
		});

		it("should indicate that the song is currently paused", function() {
			expect(player.isPlaying).toBeFalsy();

			// demonstrates use of 'not' with a custom matcher
			expect(player).not.toBePlaying(song);
		});

		it("should be possible to resume", function() {
			player.resume();
			expect(player.isPlaying).toBeTruthy();
			expect(player.currentlyPlayingSong).toEqual(song);
		});
	});

	// demonstrates use of spies to intercept and test method calls
	it("tells the current song if the user has made it a favorite", function() {
		spyOn(song, 'persistFavoriteStatus');

		player.play(song);
		player.makeFavorite();

		expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
	});

	//demonstrates use of expected exceptions
	describe("#resume", function() {
		it("should throw an exception if song is already playing", function() {
			player.play(song);

			expect(function() {
				player.resume();
			}).toThrow("song is already playing");
		});
	});*/
});