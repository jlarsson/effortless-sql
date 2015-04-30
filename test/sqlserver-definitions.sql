USE [simple-sql-test]
GO

/****** Object:  StoredProcedure [dbo].[TestGetRows]    Script Date: 2015-04-30 15:13:09 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

create procedure [dbo].[TestGetRows]
as
begin
	select 1 as a, 11 as b union all select 2 as a, 22 as b
end
GO
