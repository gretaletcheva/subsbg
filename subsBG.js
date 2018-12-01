/*
 *  Bulgarian subtitle provider plugin for Movian Media Center
 *
 *  Copyright (C) 2018 deank
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


(function(plugin) {

    var settings = plugin.createSettings(plugin.getDescriptor().id, plugin.path + "logo.png", plugin.getDescriptor().title);

    settings.createBool('sab',	 'Search subs.sab.bz', true, function(v) {sab = v;});
    settings.createBool('unacs', 'Search subsunacs.bg', true, function(v) {unacs = v;});
    settings.createBool('add',	 'Search addic7ed.com (Bulgarian)', true, function(v) {add = v;});
    settings.createBool('adden', 'Search addic7ed.com (English)', false, function(v) {adden = v;});

    plugin.addSubtitleProvider(function(req) 
	{
		function getsubs(provider, score_init, lang)
		{
			try
			{
				var json = showtime.JSONDecode(showtime.httpReq(apisrv+"sub", {
					postdata: {
						plugin: plugin.getDescriptor().id.toLowerCase(),
						key: key,
						p: provider,
						s: req.season,
						e: req.episode,
						t: escape(req.title)
					},
					method: 'POST',
					noFail: true,
				}));
				var cnt=0;

				for (var i in json) 
				{ 
					var score=parseInt(score_init);
					if(!req.season && !req.title.match(/[S|s][\d][\d][E|e][\d][\d]/) && json[i].file.match(/[S|s][\d][\d][E|e][\d][\d]/)) 
						continue;

					var year=json[i].file.match(/[\d]{4}[^p^i]/);
					if(year>1900 && year<2030) score+=parseInt(year);

					if(json[i].file.match(/1080/))		score+=30;
					if(json[i].file.match(/720/))		score+=25;
					if(json[i].file.match(/BDRip/i))	score+=20;
					if(json[i].file.match(/DVDRip/i))	score+=15;
					if(json[i].file.match(/HDRip/i))	score+=10;

					var rtitle=req.title+".srt";
					if(rtitle.toUpperCase().indexOf(json[i].file.toUpperCase())>=0)
					{
						score+=95;
						json[i].site=json[i].site+" (fulltext)";
					}

					req.addSubtitle(json[i].path, json[i].file, lang,
						json[i].type,
						json[i].site,
						score);
					cnt++;
				}
				showtime.trace("Added "+cnt+" subtitle"+(cnt>1?"s":"")+" ("+json[i].site+")");
			}
			catch (err){;}
		}

		if(sab)		getsubs("sab", 1500, "bul");
		if(unacs)	getsubs("unacs", 1000, "bul");
		if(add)		getsubs("add", 500, "bul");
		if(adden)		getsubs("adden", 499, "eng");

    });

}) (this);